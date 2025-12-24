"use client";
import React, { useCallback } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  useReactFlow,
  ReactFlow,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflow } from "@/context/workflow-context";
import { ChatView } from "@/components/workflow/chat-view";
import {
  NodeType,
  TOOL_MODE_ENUM,
  NODE_CONFIG,
  NODE_TYPES,
} from "@/constant/canvas";
import { StartNode } from "@/components/workflow/custom-nodes/start/node";
import { AgentNode } from "@/components/workflow/custom-nodes/agent/node";
import { IfElseNode } from "@/components/workflow/custom-nodes/if-else/node";
import { UserApprovalNode } from "@/components/workflow/custom-nodes/user-approval/node";
import { EndNode } from "@/components/workflow/custom-nodes/end/node";
import { generateId } from "@/lib/utils";
import Controls from "@/components/workflow/controls";
import CommentNode from "@/components/workflow/custom-nodes/comment/node";
import { NodePanel } from "./node-panel";

const WorkflowCanvas = () => {
  const { nodes, edges, view, toolMode, setNodes, setEdges } = useWorkflow();
  const { screenToFlowPosition } = useReactFlow();

  const isPreview = view === "preview";

  const nodeTypes = {
    [NODE_TYPES.START]: StartNode,
    [NODE_TYPES.AGENT]: AgentNode,
    [NODE_TYPES.IF_ELSE]: IfElseNode,
    [NODE_TYPES.USER_APPROVAL]: UserApprovalNode,
    [NODE_TYPES.END]: EndNode,
    [NODE_TYPES.COMMENT]: CommentNode,
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

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
      const nodeDataStr = event.dataTransfer.getData(
        "application/reactflow"
      ) as string;
      if (!nodeDataStr) return;

      const draggedData = JSON.parse(nodeDataStr);
      const type = draggedData.type as NodeType;

      // Get the full node configuration with default data
      const nodeConfig = NODE_CONFIG[type];
      if (!nodeConfig) return;

      // ✅ Use hook method directly
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: generateId(type),
        type: type,
        position,
        deletable: type !== NODE_TYPES.START, // Start node cannot be deleted
        data: {
          ...nodeConfig.defaultData, // Use all default properties from config
          color: nodeConfig.color,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  console.log("Rendering WorkflowCanvas with nodes:", nodes);
  console.log("Rendering WorkflowCanvas with edges:", edges);

  return (
    <div className="flex-1 h-full w-full flex relative overflow-hidden">
      <div className="flex-1 relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          deleteKeyCode={isPreview ? null : ["Backspace", "Delete"]}
          panOnDrag={!isPreview ? toolMode === TOOL_MODE_ENUM.HAND : false}
          selectionOnDrag={
            !isPreview ? toolMode === TOOL_MODE_ENUM.SELECT : false
          }
          panOnScroll={!isPreview}
          zoomOnDoubleClick={false}
          zoomOnScroll={!isPreview}
          zoomOnPinch={!isPreview}
          nodesDraggable={!isPreview}
          nodesConnectable={!isPreview}
          elementsSelectable={!isPreview}
          disableKeyboardA11y={isPreview}
          defaultViewport={{ x: 0, y: 0, zoom: 1.2 }}
          //fitView
        >
          <Background bgColor="var(--sidebar)" />
          {!isPreview && <NodePanel />}
          {!isPreview && <Controls />}
        </ReactFlow>
      </div>

      <ChatView />
    </div>
  );
};

export default WorkflowCanvas;
