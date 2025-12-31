"use client";
import React from "react";
import { useParams } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowHeader } from "./_common/header";
import WorkflowCanvas from "./_common/workflow-canvas";
import { WorkflowProvider } from "@/context/workflow-context";
import { useGetWorkflow } from "@/features/use-workflow";
import { Spinner } from "@/components/ui/spinner";

const Page = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: workflow, isPending } = useGetWorkflow(id);

  const nodes = workflow?.flowObject.nodes || [];
  const edges = workflow?.flowObject.edges || [];

  if (!workflow && !isPending) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ReactFlowProvider>
        <WorkflowProvider
          workflowId={workflow?.id || ""}
          initialNodes={nodes}
          initialEdges={edges}
        >
          <div className="flex flex-col h-screen relative">
            <WorkflowHeader name={workflow?.name} />
            <main className="flex-1 relative overflow-hidden">
              {isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner className="h-12 w-12 text-primary" />
                </div>
              ) : (
                <WorkflowCanvas workflowId={workflow.id} />
              )}
            </main>
          </div>
        </WorkflowProvider>
      </ReactFlowProvider>
    </div>
  );
};

export default Page;
