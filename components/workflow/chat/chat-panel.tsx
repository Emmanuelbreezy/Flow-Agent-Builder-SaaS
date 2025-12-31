"use client";

import React, { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
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
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Sparkles } from "lucide-react";
import { createResumableTransport } from "@/lib/ai/transport";
import { getNodeConfig, NodeType } from "@/lib/workflow/node-config";
import { Spinner } from "@/components/ui/spinner";

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
    <div className="flex flex-col justify-between h-full">
      {/* Messages */}
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <Conversation>
            <ConversationContent className="pb-10">
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent className="text-[15px]!">
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text": {
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        }
                        case "reasoning": {
                          return (
                            <div key={`${message.id}-reason-${i}`}>
                              <MessageResponse>{part.text}</MessageResponse>
                            </div>
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
                        case "data-workflow-node-start": {
                          const data = part.data as {
                            nodeType: NodeType;
                            nodeName: string;
                          };
                          const nodeConfig = getNodeConfig(data.nodeType);
                          if (!nodeConfig) return null;

                          const Icon = nodeConfig.icon;

                          return (
                            <div
                              key={`${message.id}-workflow-node-start-${i}`}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <Icon className="h-4 w-4" />
                              {data.nodeName}
                            </div>
                          );
                        }
                        case "data-workflow-node-complete": {
                          const data = part.data as {
                            nodeType: NodeType;
                            output: string;
                          };
                          const nodeConfig = getNodeConfig(data.nodeType);
                          if (!nodeConfig) return null;

                          return (
                            <div
                              key={`${message.id}-workflow-node-complete-${i}`}
                              className="text-sm"
                            >
                              {data.output && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {data.output}
                                </span>
                              )}
                            </div>
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
        </div>
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
      <div className="shrink-0 w-full px-4 py-4 border-t bg-background">
        <PromptInput className="rounded-xl!" onSubmit={handleSubmit}>
          <PromptInputBody className="rounded-xl! bg-red-500!">
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              ref={textareaRef}
              value={text}
              placeholder="Send a message..."
              className="pt-5"
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
