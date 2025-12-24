import React from "react";
import { WorkflowHeader } from "./_common/header";
import WorkflowCanvas from "./_common/workflow-canvas";
import { WorkflowProvider } from "@/context/workflow-context";
import { ReactFlowProvider } from "@xyflow/react";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background">
      <WorkflowProvider workflowId={id}>
        <ReactFlowProvider>
          <div className="flex flex-col h-screen relative">
            <WorkflowHeader />
            <main className="flex-1 relative overflow-hidden">
              <WorkflowCanvas />
            </main>
          </div>
        </ReactFlowProvider>
      </WorkflowProvider>
    </div>
  );
};

export default Page;
