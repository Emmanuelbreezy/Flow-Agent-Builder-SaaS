/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import axios from "axios";
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

import { getNodeConfig, NodeType } from "@/lib/workflow/node-config";
import { Spinner } from "@/components/ui/spinner";
import { nanoid } from "nanoid";
import { createWorkflowTransport } from "@/lib/transport";

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

  console.log(messages, "messages");

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

  const handleApprovalNotify = async (nodeId: string, approved: boolean) => {
    try {
      await axios.post(`/api/upstash/notify`, {
        eventId: `approval-${nodeId}-${Date.now()}`,
        eventData: { approved },
      });
    } catch (error) {
      console.error("Failed to notify approval:", error);
    }
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
                          return (
                            <UserApproval
                              key={`${message.id}-node-${i}`}
                              data={data}
                              onApprove={(nodeId) => {
                                handleApprovalNotify(nodeId, true);
                              }}
                              onReject={(nodeId) => {
                                handleApprovalNotify(nodeId, false);
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

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 font-mono">
                  <Spinner className="size-3.5" />
                  Start
                </div>
              </div>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        // <div className="flex-[1.3] flex flex-col items-center justify-center ">
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
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
      {/* <div className="shrink-0 flex-[0.4] w-full px-4 pt-2  bg-background"> */}
      <div className="shrink-0 w-full flex-[0.4] px-4 pt-2 pb-4 bg-background border-t">
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
              disabled={!input.trim() || !status}
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
    status: "loading" | "streaming" | "complete";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(data.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await onReject(data.id);
    } finally {
      setIsLoading(false);
    }
  };
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
                variant="default"
                disabled={isLoading}
                onClick={handleApprove}
              >
                Approve
                {isLoading && <Spinner />}
              </ConfirmationAction>
              <ConfirmationAction
                variant="outline"
                disabled={isLoading}
                onClick={handleReject}
              >
                Reject
                {isLoading && <Spinner />}
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
