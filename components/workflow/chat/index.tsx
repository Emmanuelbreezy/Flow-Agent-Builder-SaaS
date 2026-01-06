"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useWorkflow } from "@/context/workflow-context";
import { ChatPanel } from "./chat-panel";

const ChatView = ({ workflowId }: { workflowId: string }) => {
  const { view, setView } = useWorkflow();
  const isPreview = view === "preview";

  const handlePreviewClose = () => {
    setView("edit");
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
          className="sm:max-w-lg! w-full p-0 top-18! h-full max-h-[calc(100vh-5rem)] z-95 bg-background rounded-md overflow-hidden mr-1"
          overlayClass="bg-black/5! backdrop-blur-none!"
        >
          <div className="h-full">
            <ChatPanel workflowId={workflowId} initialMessages={[]} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatView;
