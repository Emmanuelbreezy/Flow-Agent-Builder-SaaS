/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
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

import { createResumableTransport } from "@/lib/ai/transport";
import { getNodeConfig, NodeType } from "@/lib/workflow/node-config";
import { Spinner } from "@/components/ui/spinner";
import { nanoid } from "nanoid";

interface ChatPanelProps {
  initialMessages: UIMessage[];
}

export const ChatPanel = ({ initialMessages = [] }: ChatPanelProps) => {
  const [text, setText] = useState<string>("");
  const [messageId, setMessageId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: chatId ?? undefined,
    messages: initialMessages,
    transport: createResumableTransport({
      messageId,
      setChatId,
      setMessageId,
    }),
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      {messages.length > 0 ? (
        <Conversation className="flex-1">
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
                      case "data-workflow-start": {
                        return (
                          <div
                            key={`${message.id}-workflow-start-${i}`}
                            className="text-sm text-muted-foreground"
                          >
                            🚀 Starting workflow execution...
                          </div>
                        );
                      }

                      case "data-workflow-node": {
                        const data = part.data as {
                          id: string;
                          nodeType: NodeType;
                          nodeName: string;
                          status: "loading" | "complete";
                          state: "approval-requested" | "approval-responded";
                          output?: any;
                        };
                        if (
                          data.nodeType === "user_approval" &&
                          data.state === "approval-requested"
                        ) {
                          console.log(data);
                          return (
                            <UserApproval
                              key={`${message.id}-node-${i}`}
                              data={data}
                              onApprove={(nodeId) => {
                                // sendMessage({
                                //   role: "user",
                                //   content: JSON.stringify({
                                //     type: "approval",
                                //     nodeId,
                                //     approved: true,
                                //   }),
                                // });
                              }}
                              onReject={(nodeId) => {
                                // sendMessage({
                                //   role: "user",
                                //   content: JSON.stringify({
                                //     type: "approval",
                                //     nodeId,
                                //     approved: false,
                                //   }),
                                // });
                              }}
                            />
                          );
                        }
                        return (
                          <NodeDisplay
                            key={`${message.id}-workflow-node-${i}`}
                            data={data}
                            messageId={message.id}
                            partIndex={i}
                          />
                        );
                      }
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
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
      <div className="shrink-0 flex-[0.4] w-full px-4 pt-2  bg-background">
        <PromptInput className="shadow-md rounded-xl!" onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              ref={textareaRef}
              value={text}
              placeholder="Send a message..."
              className="pt-3"
            />
          </PromptInputBody>
          <PromptInputFooter className="flex justify-end">
            <PromptInputSubmit
              disabled={!text.trim() || !status}
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

interface NodeDisplayProps {
  data: {
    id: string;
    nodeType: NodeType;
    nodeName: string;
    status: "loading" | "complete";
    output?: any;
  };
  messageId: string;
  partIndex: number;
}

export const NodeDisplay = ({
  data,
  messageId,
  partIndex,
}: NodeDisplayProps) => {
  const nodeConfig = getNodeConfig(data.nodeType);
  if (!nodeConfig) return null;
  const Icon = nodeConfig.icon;
  const outputText =
    typeof data.output === "string"
      ? data.output
      : JSON.stringify(data.output, null, 2);
  return (
    <div key={`${messageId}-node-${partIndex}`}>
      {/* Header */}
      <div
        className={`px-1 py-2 flex items-center gap-2 ${
          data.status === "loading" && "animate-pulse"
        }`}
      >
        {data.status === "loading" ? <Spinner /> : <Icon className="h-4 w-4" />}
        <span className="text-sm font-medium">{data.nodeName}</span>
      </div>
      {/* Content */}
      {data.output && data.status === "complete" && (
        <div className="px-3 py-2">
          <MessageResponse>{outputText}</MessageResponse>
        </div>
      )}
    </div>
  );
};

interface UserApprovalProps {
  data: {
    id: string;
    nodeName: string;
    status: "loading" | "complete";
    output?: {
      message?: string;
      response?: string;
    };
    state: "approval-requested" | "approval-responded";
    approval?: {
      id: string;
      approved: boolean;
    };
  };
  onApprove: (nodeId: string) => void;
  onReject: (nodeId: string) => void;
}

export const UserApproval = ({
  data,
  onApprove,
  onReject,
}: UserApprovalProps) => {
  return (
    <>
      <Confirmation
        approval={{ id: nanoid() }}
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
                onClick={() => onApprove(data.id)}
                variant="default"
              >
                Approve
              </ConfirmationAction>
              <ConfirmationAction
                onClick={() => onReject(data.id)}
                variant="outline"
              >
                Reject
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
