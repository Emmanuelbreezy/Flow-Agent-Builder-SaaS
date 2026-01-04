"use client";
import React, { useCallback } from "react";
import {
  addEdge,
  Connection,
  OnConnect,
  useReactFlow,
  ReactFlow,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "@/context/workflow-context";
import ChatView from "@/components/workflow/chat";
import { NodeType, createNode } from "@/lib/workflow/node-config";
import { StartNode } from "@/components/workflow/custom-nodes/start/node";
import { AgentNode } from "@/components/workflow/custom-nodes/agent/node";
import { IfElseNode } from "@/components/workflow/custom-nodes/if-else/node";
import { UserApprovalNode } from "@/components/workflow/custom-nodes/user-approval/node";
import { EndNode } from "@/components/workflow/custom-nodes/end/node";
import Controls from "@/components/workflow/controls";
import CommentNode from "@/components/workflow/custom-nodes/comment/node";
import { NodePanel } from "./node-panel";
import {
  ActionBar,
  ActionBarGroup,
  ActionBarItem,
} from "@/components/ui/action-bar";
import { HttpNode } from "@/components/workflow/custom-nodes/http/node";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useUpdateWorkflow } from "@/features/use-workflow";
import { NodeTypeEnum } from "@/lib/workflow/node-config";
import { Spinner } from "@/components/ui/spinner";

const WorkflowCanvas = ({ workflowId }: { workflowId: string }) => {
  const {
    view,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
  } = useWorkflow();
  const { screenToFlowPosition } = useReactFlow();

  // Use unsaved changes hook
  const { hasUnsavedChanges, discardChanges } = useUnsavedChanges({
    nodes,
    edges,
  });

  // Use update workflow mutation
  const { mutate: updateWorkflow, isPending: isSaving } =
    useUpdateWorkflow(workflowId);

  const isPreview = view === "preview";

  const nodeTypes = {
    [NodeTypeEnum.START]: StartNode,
    [NodeTypeEnum.AGENT]: AgentNode,
    [NodeTypeEnum.IF_ELSE]: IfElseNode,
    [NodeTypeEnum.USER_APPROVAL]: UserApprovalNode,
    [NodeTypeEnum.END]: EndNode,
    [NodeTypeEnum.COMMENT]: CommentNode,
    [NodeTypeEnum.HTTP]: HttpNode,
  };

  // const onNodesChange: OnNodesChange = useCallback(
  //   (changes) => {
  //     setNodes((nds) => applyNodeChanges(changes, nds));
  //   },
  //   [setNodes]
  // );
  // const onEdgesChange: OnEdgesChange = useCallback(
  //   (changes) => {
  //     setEdges((eds) => applyEdgeChanges(changes, eds));
  //   },
  //   [setEdges]
  // );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const node_type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (!node_type) return;

      // ✅ Use hook method directly
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createNode({
        type: node_type,
        position,
      });
      setNodes((nds) => [...nds, newNode]);

      //Old way
      //  const newNode = {
      //    id: generateId(node_type),
      //    type: node_type,
      //    position,
      //    deletable: node_type !== NODE_TYPES.START, // Start node cannot be deleted
      //    data: {
      //      // Use all default properties from
      //      ...nodeConfig.inputs,
      //      label: nodeConfig.label,
      //      outputs: nodeConfig.outputs, // ← Set default output schema
      //      color: nodeConfig.color,
      //    },
      //  };
    },
    [screenToFlowPosition, setNodes]
  );

  const handleDiscardChanges = () => {
    const result = discardChanges();
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleSaveChanges = () => {
    updateWorkflow({ nodes, edges });
  };

  console.log("Rendering WorkflowCanvas with nodes:", nodes);
  console.log("Rendering WorkflowCanvas with edges:", edges);

  return (
    <>
      <div className="flex-1 h-full w-full flex relative overflow-hidden">
        <div className={"flex-1 relative h-full"}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            defaultViewport={{ x: 0, y: 0, zoom: 1.2 }}
            //fitView
          >
            <Background
              variant={BackgroundVariant.Dots}
              bgColor="var(--sidebar)"
            />
            {!isPreview && <NodePanel disabled={isSaving} />}
            {!isPreview && <Controls />}
          </ReactFlow>
        </div>

        <ChatView workflowId={workflowId} />
      </div>

      {/* Action Bar for unsaved changes */}
      <ActionBar
        open={hasUnsavedChanges}
        side="top"
        align="center"
        sideOffset={70}
        className="max-w-xs"
      >
        <ActionBarGroup>
          <ActionBarItem
            disabled={isSaving}
            onClick={handleDiscardChanges}
            variant="ghost"
          >
            Discard
          </ActionBarItem>
          <ActionBarItem onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Spinner />} Save Changes
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </>
  );
};

export default WorkflowCanvas;
