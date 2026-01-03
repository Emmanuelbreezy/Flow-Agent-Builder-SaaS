"use client";

import React, { useState } from "react";
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

const ChatView = ({ workflowId }: { workflowId: string }) => {
  const { view, setView } = useWorkflow();
  const isPreview = view === "preview";

  // Move states here
  const [chatId, setChatId] = useState<string | null>(() =>
    crypto.randomUUID()
  );

  const handlePreviewClose = () => {
    setView("edit");
  };

  const handleNewChat = () => {
    setChatId(crypto.randomUUID());
  };

  // Dummy UIMessage for testing
  // const dummyMessages: UIMessage[] = [
  //   {
  //     id: "msg-1",
  //     role: "user",
  //     parts: [
  //       {
  //         type: "text",
  //         text: "i want to return the item",
  //       },
  //     ],
  //   },

  //   {
  //     id: "msg-2",
  //     role: "assistant",
  //     parts: [
  //       {
  //         type: "data-workflow-start",
  //         data: { text: "Starting workflow execution..." },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "start",
  //           nodeType: "start",
  //           nodeName: "Start",
  //           status: "complete",
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "agent-1",
  //           nodeType: "agent",
  //           nodeName: "Classification agent",
  //           status: "complete",
  //           output: { classification: "return_item" },
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "condition-1",
  //           nodeType: "if_else",
  //           nodeName: "Condition",
  //           status: "complete",
  //           output: "",
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "agent-2",
  //           nodeType: "agent",
  //           nodeName: "Agent",
  //           status: "loading",
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "agent-2",
  //           nodeType: "agent",
  //           nodeName: "Agent",
  //           status: "complete",
  //           output:
  //             "We can help you with that! We also offer a replacement device with free shipping if you're interested. Would you like to proceed with the return or get a replacement?",
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "user-approval-1",
  //           nodeType: "user_approval",
  //           nodeName: "User Approval",
  //           status: "loading",
  //           output: {
  //             message: "Do you want to proceed with the return?",
  //           },
  //           state: "approval-requested",
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "user-approval-1",
  //           nodeType: "user_approval",
  //           nodeName: "User Approval",
  //           status: "complete",
  //           output: {
  //             message: "Do you want to proceed with the return?",
  //             response: "Approved",
  //           },
  //           state: "approval-responded",
  //           approval: {
  //             id: "user-approval-1",
  //             approved: true,
  //           },
  //         },
  //       },
  //       {
  //         type: "data-workflow-node",
  //         data: {
  //           id: "end-1",
  //           nodeType: "end",
  //           nodeName: "End",
  //           status: "complete",
  //           output: "How can I assist you further?",
  //         },
  //       },
  //     ],
  //   },
  // ];

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
              <SheetTitle>Workflow Preview</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-muted-foreground"
                onClick={handleNewChat}
              >
                New chat <Plus size={14} />
              </Button>
            </div>
          </SheetHeader>

          <div className="h-full">
            <ChatPanel
              workflowId={workflowId}
              chatId={chatId}
              initialMessages={[]}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatView;
