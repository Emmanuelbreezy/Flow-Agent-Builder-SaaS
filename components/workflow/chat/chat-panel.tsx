/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import axios from "axios";
import { AlertCircle, ArrowUp, Check, Plus, Sparkles } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface ChatPanelProps {
  workflowId: string;
  initialMessages?: UIMessage[];
}

export const ChatPanel = ({
  workflowId,
  initialMessages = [],
}: ChatPanelProps) => {
  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(() =>
    crypto.randomUUID()
  );

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

  const handleNewChat = () => {
    setChatId(crypto.randomUUID());
  };

  return (
    <div className="flex flex-col h-full bg-background  overflow-hidden">
      {/* --- Chat Header --- */}
      <div className="bg-linear-to-br from-primary via-primary/90 to-primary/80 px-6 py-4 relative shadow-sm ">
        <div className="flex items-center justify-between text-white">
          <h5 className="text-lg font-bold">Workflow Preview</h5>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            New chat <Plus size={14} />
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col flex-1 overflow-hidden">
        {messages.length > 0 ? (
          <Conversation className="flex-1">
            <ConversationContent className="pt-10 px-4">
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
                          const data = part.data as {
                            id: string;
                            nodeType: NodeType;
                            nodeName: string;
                            status: "loading" | "complete";
                            // state: "approval-requested" | "approval-responded";
                            type:
                              | "text-delta"
                              | "tool-call"
                              | "tool-result"
                              | "reasoning";
                            output?: any;
                          };

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
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles size={20} className="text-primary" />
                </EmptyMedia>
                <EmptyTitle>Preview your workflow</EmptyTitle>
                <EmptyDescription>
                  Write a prompt as if you&apos;re the user to test your
                  workflow.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}

        {/* --- Chat Footer --- */}
        <div className="p-4 bg-background border-t">
          <PromptInput
            className="rounded-xl! shadow-sm border"
            onSubmit={handleSubmit}
          >
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Send a message..."
                className="pt-3"
              />
            </PromptInputBody>
            <PromptInputFooter className="flex justify-end p-2 pt-0">
              <PromptInputSubmit
                disabled={!input.trim() || isLoading}
                className="h-9! w-9! p-0! rounded-xl! bg-primary! text-primary-foreground!"
              >
                <ArrowUp size={18} />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export interface NodeDisplayProps {
  data: {
    id: string;
    nodeType: NodeType;
    nodeName: string;
    //type: "text-delta" | "tool-call" | "tool-result" | "reasoning";
    status: "loading" | "error" | "complete";
    delta?: any;
    toolCall?: { name: string };
    toolResult?: { name: string; result: any };
    output?: any;
    error?: any;
  };
}

export const NodeDisplay = ({ data }: NodeDisplayProps) => {
  const nodeConfig = getNodeConfig(data.nodeType);
  if (!nodeConfig) return null;

  const Icon = nodeConfig.icon;
  const { status, output, error, toolCall, toolResult } = data;

  return (
    <div>
      {/* Header */}
      <div
        className={cn(
          `px-1 py-2 flex items-center gap-2`,
          status === "loading" && "animate-pulse"
        )}
      >
        {status === "loading" ? (
          <Spinner />
        ) : status === "error" ? (
          <AlertCircle className="text-destructive h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">{data.nodeName}</span>
      </div>
      {/* Content */}
      <div>
        {toolCall || toolResult ? (
          <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border flex items-center gap-2">
            {toolResult ? (
              <>
                <Check className="size-4 text-green-600" />
                <span className="text-sm">Used {toolResult.name}</span>
              </>
            ) : (
              <TextShimmerLoader text={`Calling ${toolCall?.name}...`} />
            )}
          </div>
        ) : null}

        {output && (
          <div className="px-3 py-2">
            <MessageResponse>
              {typeof output === "string"
                ? output
                : JSON.stringify(output, null, 2)}
            </MessageResponse>
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {JSON.stringify({
              error,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

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

// <div>
//   <div className="border-b py-3">
//     <div className="flex items-center justify-between">
//       <h5>Workflow Preview</h5>
//       <Button
//         variant="ghost"
//         size="sm"
//         className="h-8 gap-2 text-muted-foreground"
//         onClick={handleNewChat}
//       >
//         New chat <Plus size={14} />
//       </Button>
//     </div>
//   </div>
//   <div className="relative flex flex-col h-full overflow-hidden">
//     {/* Messages */}
//     {messages.length > 0 ? (
//       <Conversation className="flex-1 h-full">
//         <ConversationContent>
//           {messages.map((message) => (
//             <Message from={message.role} key={message.id}>
//               <MessageContent className="text-[14.5px]!">
//                 {message.parts.map((part, i) => {
//                   switch (part.type) {
//                     case "text": {
//                       return (
//                         <MessageResponse key={`${message.id}-${i}`}>
//                           {part.text}
//                         </MessageResponse>
//                       );
//                     }
//                     // case "data-workflow-start": {
//                     //   return (
//                     //     <div
//                     //       key={`${message.id}-workflow-start-${i}`}
//                     //       className="text-sm text-muted-foreground"
//                     //     >
//                     //       🚀 Starting workflow execution...
//                     //     </div>
//                     //   );
//                     // }
//                     case "data-workflow-node":
//                       const data = part.data as any;
//                       return (
//                         <NodeDisplay
//                           key={`${message.id}-workflow-node-${i}`}
//                           data={data}
//                         />
//                       );

//                     default:
//                       return null;
//                   }
//                 })}
//               </MessageContent>
//             </Message>
//           ))}

//           {isLoading ? (
//             <div className="px-2">
//               <Loader variant={"dots"} size={"md"} />
//             </div>
//           ) : null}
//         </ConversationContent>
//         <ConversationScrollButton />
//       </Conversation>
//     ) : (
//       // <div className="flex-[1.3] flex flex-col items-center justify-center ">
//       <div className="flex-[1.3] flex flex-col items-center justify-center">
//         <Empty className="border-0">
//           <EmptyHeader>
//             <EmptyMedia variant="icon">
//               <Sparkles size={20} />
//             </EmptyMedia>
//             <EmptyTitle>Preview your workflow</EmptyTitle>
//             <EmptyDescription className="px-2">
//               Write a prompt as if you&apos;re the user to test your
//               workflow.
//             </EmptyDescription>
//           </EmptyHeader>
//         </Empty>
//       </div>
//     )}

//     {/* Input */}
//     <div className="shrink-0 w-full flex-[0.4] px-4 py-4 bg-background border-t">
//       <PromptInput
//         className="shadow-md rounded-xl!"
//         onSubmit={handleSubmit}
//       >
//         <PromptInputBody>
//           <PromptInputTextarea
//             onChange={(e) => setInput(e.target.value)}
//             value={input}
//             placeholder="Send a message..."
//             className="pt-3"
//           />
//         </PromptInputBody>
//         <PromptInputFooter className="flex justify-end">
//           <PromptInputSubmit
//             disabled={!input.trim() || !status || isLoading}
//             className="h-9! w-9! p-0! rounded-xl! bg-foreground! text-background!"
//           >
//             <ArrowUp size={18} />
//           </PromptInputSubmit>
//         </PromptInputFooter>
//       </PromptInput>
//     </div>
//   </div>
// </div>

// interface NodeDisplayProps {

// const renderBody = () => {
//   switch (type) {
//     case "text-delta":
//       return (
//         <div className="px-3 py-2">
//           <MessageResponse>{output}</MessageResponse>
//         </div>
//       );

//     case "reasoning":
//       return (
//         <div className="px-3 py-2">
//           <Reasoning isStreaming={status === "loading"}>
//             <ReasoningTrigger />
//             <ReasoningContent>{output}</ReasoningContent>
//           </Reasoning>
//         </div>
//       );

//     case "tool-call":
//       return (
//         <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border">
//           <TextShimmerLoader text={`Calling ${toolCall?.name}...`} />
//         </div>
//       );

//     case "tool-result":
//       return (
//         <div className="mx-3 my-2 px-3 py-2 bg-muted/50 rounded-lg border space-y-1">
//           <span className="text-sm">Used {toolResult?.name}</span>
//           <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
//             {JSON.stringify(toolResult?.result, null, 2)}
//           </pre>
//         </div>
//       );

//     default:
//       return (
//         <>
//           {status === "complete" && output && (
//             <div className="px-3 py-2">
//               <MessageResponse>
//                 {typeof output === "string"
//                   ? output
//                   : JSON.stringify(output, null, 2)}
//               </MessageResponse>
//             </div>
//           )}

//           {status === "error" && (
//             <div className="mx-3 my-2 p-3 bg-destructive/10 text-destructive rounded-md text-xs">
//               {JSON.stringify(error)}
//             </div>
//           )}
//         </>
//       );
//   }
// };
