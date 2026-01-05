/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import axios from "axios";
import { AlertCircle, ArrowUp, Check, Sparkles, Square } from "lucide-react";
import { UIMessage, useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationAccepted,
  ConfirmationRejected,
} from "@/components/ai-elements/confirmation";

import { getNodeConfig, NodeType } from "@/lib/workflow/node-config";
import { Spinner } from "@/components/ui/spinner";
import { nanoid } from "nanoid";
import { createWorkflowTransport } from "@/lib/transport";
import { cn } from "@/lib/utils";
import { Loader, TextShimmerLoader } from "@/components/ui/loader";

interface ChatPanelProps {
  workflowId: string;
  chatId: string | null;
  initialMessages?: UIMessage[];
}

export const ChatPanel = ({
  workflowId,
  chatId,
  initialMessages = [],
}: ChatPanelProps) => {
  const [input, setInput] = useState<string>("");

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: chatId ?? undefined,
    messages: initialMessages,
    transport: createWorkflowTransport({
      workflowId,
    }),
  });

  const isLoading =
    status === "submitted" ||
    (status === "streaming" &&
      !Boolean(
        messages[messages.length - 1]?.parts.some(
          (part) => part.type === "text" && Boolean(part.text)
        )
      ));

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Messages */}
      {messages.length > 0 ? (
        <Conversation className="flex-1 h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent className="text-[14.5px]!">
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text": {
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      }
                      // case "data-workflow-start": {
                      //   return (
                      //     <div
                      //       key={`${message.id}-workflow-start-${i}`}
                      //       className="text-sm text-muted-foreground"
                      //     >
                      //       🚀 Starting workflow execution...
                      //     </div>
                      //   );
                      // }
                      case "data-workflow-node":
                        const data = part.data as any;
                        return (
                          <NodeDisplay
                            key={`${message.id}-workflow-node-${i}`}
                            data={data}
                          />
                        );

                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}

            {isLoading ? (
              <div className="px-2">
                <Loader variant={"dots"} size={"md"} />
              </div>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        // <div className="flex-[1.3] flex flex-col items-center justify-center ">
        <div className="flex-[1.3] flex flex-col items-center justify-center">
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles size={20} />
              </EmptyMedia>
              <EmptyTitle>Preview your workflow</EmptyTitle>
              <EmptyDescription className="px-2">
                Write a prompt as if you&apos;re the user to test your workflow.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 w-full flex-[0.4] px-4 py-4 bg-background border-t">
        <PromptInput className="shadow-md rounded-xl!" onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Send a message..."
              className="pt-3"
            />
          </PromptInputBody>
          <PromptInputFooter className="flex justify-end">
            <PromptInputSubmit
              disabled={!input.trim() || !status || isLoading}
              className="h-9! w-9! p-0! rounded-xl! bg-foreground! text-background!"
            >
              <ArrowUp size={18} />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export interface NodeDisplayProps {
  data: {
    id: string;
    nodeType: NodeType;
    nodeName: string;
    type: "text-delta" | "tool-call" | "tool-result";
    status: "loading" | "error" | "complete";
    delta?: any;
    toolCall?: {
      name: string;
    };
    toolResult?: {
      name: string;
      result: any;
    };
    output?: any;
    error?: any;
  };
}

export const NodeDisplay = ({ data }: NodeDisplayProps) => {
  const nodeConfig = getNodeConfig(data.nodeType);
  const [text, setText] = useState("");

  // Always call hooks before any conditional return
  React.useEffect(() => {
    if (data.type === "text-delta" && data.delta) {
      setText((prev) => prev + data.delta);
    }
  }, [data.type, data.delta]);

  if (!nodeConfig) return null;

  const Icon = nodeConfig.icon;
  const { status, output, error, type, toolCall, toolResult } = data;

  const Header = (
    <div
      className={cn(
        "px-2 py-2 flex items-center gap-2",
        status === "loading" && "animate-pulse"
      )}
    >
      {status === "loading" ? (
        <Spinner />
      ) : status === "error" ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : (
        <Icon className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm font-medium">{data.nodeName}</span>
    </div>
  );

  const renderBody = () => {
    switch (type) {
      case "text-delta":
        return (
          <div className="px-3 py-2">
            <MessageResponse>{text}</MessageResponse>
          </div>
        );

      case "tool-call":
        return (
          <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border">
            <TextShimmerLoader text={`Calling ${toolCall?.name}...`} />
          </div>
        );

      case "tool-result":
        return (
          <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border space-y-1">
            <span className="text-sm">Used {toolResult?.name}</span>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(toolResult?.result, null, 2)}
            </pre>
          </div>
        );

      default:
        return (
          <>
            {status === "complete" && output && (
              <div className="px-3 py-2">
                <MessageResponse>
                  {typeof output === "string"
                    ? output
                    : JSON.stringify(output, null, 2)}
                </MessageResponse>
              </div>
            )}

            {status === "error" && (
              <div className="mx-3 my-2 p-3 bg-destructive/10 text-destructive rounded-md text-xs">
                {JSON.stringify(error)}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div>
      {Header}
      {renderBody()}
    </div>
  );
};

///
//
//
//
//
//
///
///
//
//
//
//

// interface NodeDisplayProps {
//   data: {
//     id: string;
//     nodeType: NodeType;
//     nodeName: string;
//     status: "loading" | "error" | "complete";
//     reasoning?: string;
//     toolCall?: { name: string };
//     toolResult?: { name: string; result: any };
//     output?: any;
//     error?: any;
//   };
//   messageId: string;
//   partIndex: number;
// }

// export const NodeDisplay = ({
//   data,
//   messageId,
//   partIndex,
// }: NodeDisplayProps) => {
//   const nodeConfig = getNodeConfig(data.nodeType);
//   if (!nodeConfig) return null;
//   const Icon = nodeConfig.icon;
//   const { status, output, toolCall, toolResult, error } = data;

//   return (
//     <div key={`${messageId}-node-${partIndex}`}>
//       {/* Header */}
//       <div
//         className={cn(
//           `px-1 py-2 flex items-center gap-2`,
//           status === "loading" && "animate-pulse"
//         )}
//       >
//         {status === "loading" ? (
//           <Spinner />
//         ) : status === "error" ? (
//           <AlertCircle className="text-destructive h-4 w-4" />
//         ) : (
//           <Icon className="h-4 w-4" />
//         )}
//         <span className="text-sm font-medium">{data.nodeName}</span>
//       </div>
//       {/* Content */}
//       <div>
//         {toolCall || toolResult ? (
//           <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border flex items-center gap-2">
//             {toolResult ? (
//               <>
//                 <Check className="size-4 text-green-600" />
//                 <span className="text-sm">Used {toolResult.name}</span>
//               </>
//             ) : (
//               <TextShimmerLoader text={`Calling ${toolCall?.name}...`} />
//             )}
//           </div>
//         ) : null}
//         {output && (
//           <div className="px-3 py-2">
//             <MessageResponse>
//               {typeof output === "string"
//                 ? output
//                 : JSON.stringify(output, null, 2)}
//             </MessageResponse>
//           </div>
//         )}

//         {status === "error" && (
//           <div className="p-3 bg-destructive/10 text-destructive rounded-md">
//             {JSON.stringify({
//               error,
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
interface UserApprovalProps {
  data: {
    id: string;
    nodeName: string;
    status: "loading" | "complete";
    output?: {
      message?: string;
      response?: string;
      approved: boolean;
    };
    state: "approval-requested" | "approval-responded";
    eventId?: string;
  };
}

export const UserApproval = ({ data }: UserApprovalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleApproval = async (approved: boolean) => {
    if (!data.eventId) return;
    if (approved) {
      setSelectedOption("approve");
    } else {
      setSelectedOption("reject");
    }
    setIsLoading(true);
    try {
      await axios.post(`/api/upstash/notify`, {
        eventId: data.eventId,
        eventData: { approved },
      });
    } catch (error) {
      console.error("Failed to notify approval:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Confirmation
        approval={{
          id: nanoid(),
          approved: data.output?.approved,
        }}
        state={data.state}
        className="my-2"
      >
        <ConfirmationTitle className="font-semibold">
          {data.nodeName}
        </ConfirmationTitle>

        <ConfirmationRequest>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {data.output?.message || "Do you want to proceed?"}
            </p>
            <ConfirmationActions>
              <ConfirmationAction
                variant="default"
                disabled={isLoading}
                onClick={() => handleApproval(true)}
              >
                Approve
                {isLoading && selectedOption === "approve" && <Spinner />}
              </ConfirmationAction>
              <ConfirmationAction
                variant="outline"
                disabled={isLoading}
                onClick={() => handleApproval(false)}
              >
                Reject
                {isLoading && selectedOption === "reject" && <Spinner />}
              </ConfirmationAction>
            </ConfirmationActions>
          </div>
        </ConfirmationRequest>

        <ConfirmationAccepted>
          <div className="text-sm text-green-600">
            ✓ {data.output?.response || "Approved"}
          </div>
        </ConfirmationAccepted>

        <ConfirmationRejected>
          <div className="text-sm text-red-600">✗ Rejected</div>
        </ConfirmationRejected>
      </Confirmation>
    </>
  );
};
