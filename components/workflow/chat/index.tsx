"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWorkflow } from "@/context/workflow-context";
import { ChatPanel } from "./chat-panel";
import type { UIMessage } from "@ai-sdk/react";

const ChatView = () => {
  const { view, setView } = useWorkflow();
  const isPreview = view === "preview";

  const handlePreviewClose = () => {
    setView("edit");
  };

  // Dummy UIMessage for testing
  const dummyMessages: UIMessage[] = [
    {
      id: "msg-1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "What is the capital of France?",
        },
      ],
    },
    {
      id: "msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "The capital of France is Paris.",
        },
      ],
    },
    {
      id: "msg-3",
      role: "user",

      parts: [
        {
          type: "text",
          text: "Execute my workflow",
        },
      ],
    },
    {
      id: "msg-4",
      role: "assistant",

      parts: [
        {
          type: "data-workflow-start",
          data: { text: "Starting workflow execution..." },
        },
        {
          type: "text",
          text: "Workflow started successfully",
        },
        {
          type: "reasoning",
          text: "Processing your request with multiple agents...",
        },
        {
          type: "data-workflow-node-start",
          data: { nodeType: "agent", nodeName: "Agent 1" },
        },
        {
          type: "text",
          text: "Agent processing input...",
        },
        {
          type: "data-workflow-node-complete",
          data: { nodeType: "agent", output: "Agent response" },
        },
        {
          type: "data-workflow-node-start",
          data: { nodeType: "if/else", nodeName: "If Condition" },
        },
        {
          type: "data-workflow-node-complete",
          data: { nodeType: "if/else", output: "If Condition met" },
        },
        {
          type: "data-workflow-node-start",
          data: { nodeType: "User_approval", nodeName: "User Approval" },
        },
        {
          type: "data-workflow-node-complete",
          data: { nodeType: "User_approval", output: "User approved" },
        },
        {
          type: "data-workflow-node-start",
          data: { nodeType: "end", nodeName: "End" },
        },
        {
          type: "data-workflow-node-complete",
          data: { nodeType: "end", output: "Workflow ended" },
        },
        {
          type: "data-workflow-complete",
          data: { output: { result: "Final output from workflow" } },
        },
      ],
    },
  ];

  return (
    <>
      <Sheet
        open={isPreview}
        onOpenChange={(open) => !open && handlePreviewClose()}
        modal={false}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="sm:max-w-lg! w-full p-0 border-l top-18! h-full max-h-[calc(100vh-5rem)] z-95 bg-card rounded-lg! overflow-hidden shadow-lg"
          overlayClass="bg-black/5! backdrop-blur-none!"
        >
          <SheetHeader className="border-b py-3">
            <div className="flex items-center justify-between">
              <SheetTitle>Chat Preview</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-muted-foreground"
              >
                New chat <Plus size={14} />
              </Button>
            </div>
          </SheetHeader>

          <div className="h-full">
            <ChatPanel initialMessages={dummyMessages} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatView;
