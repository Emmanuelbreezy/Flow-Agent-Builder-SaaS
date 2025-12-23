"use client";
import React, { useCallback, useState } from "react";
import { nanoid } from "nanoid";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  useReactFlow,
  Node,
} from "@xyflow/react";
import { useWorkflow } from "@/context/workflow-context";
import { Canvas } from "@/components/ai-elements/canvas";
import Controls from "@/components/canvas/controls";
import { ChatView } from "@/components/canvas/chat-view";
import { NODE_TYPES, NodeType, TOOL_MODE_ENUM } from "@/constant/canvas";
import WorkflowCanvasPanel from "./workflow-canvas-panel";
import { StartNode } from "@/components/canvas/custom-nodes/start/node";
import { AgentNode } from "@/components/canvas/custom-nodes/agent/node";
import { IfElseNode } from "@/components/canvas/custom-nodes/if-else/node";
import { UserApprovalNode } from "@/components/canvas/custom-nodes/user-approval/node";
import { EndNode } from "@/components/canvas/custom-nodes/end/node";
import { generateId } from "@/lib/utils";

const WorkflowCanvas = () => {
  const { nodes, edges, view, toolMode, setNodes, setEdges } = useWorkflow();
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const isPreview = view === "preview";

  const nodeTypes = {
    [NODE_TYPES.START]: StartNode,
    [NODE_TYPES.AGENT]: AgentNode,
    [NODE_TYPES.IF_ELSE]: IfElseNode,
    [NODE_TYPES.USER_APPROVAL]: UserApprovalNode,
    [NODE_TYPES.END]: EndNode,
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      console.log(changes, "changes");
      // Track node selection
      const selectionChange = changes.find(
        (change) => change.type === "select"
      );
      if (selectionChange && "selected" in selectionChange) {
        if (selectionChange.selected) {
          const selected = nodes.find((n) => n.id === selectionChange.id);
          setSelectedNode(selected || null);
        } else {
          setSelectedNode(null);
        }
      }
    },
    [setNodes, nodes]
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

      const data = JSON.parse(nodeDataStr);
      const type = data.type as NodeType;
      console.log("Dropped node data:", data);

      // ✅ Use hook method directly
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: generateId(type),
        type: type as NodeType,
        position,
        deletable: true,
        data: {
          ...data,
          label: data.name, // Use name as label
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
        <Canvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          panOnDrag={!isPreview ? toolMode === TOOL_MODE_ENUM.HAND : false}
          selectionOnDrag={
            !isPreview ? toolMode === TOOL_MODE_ENUM.SELECT : false
          }
          defaultViewport={{ x: 0, y: 0, zoom: 1.2 }} // ✅ Set to 50%
          fitView={false} // ✅ Disable fitView if using defaultViewport
          disabled={isPreview}
        >
          {!isPreview && <WorkflowCanvasPanel selectedNode={selectedNode} />}
          {!isPreview && <Controls />}
        </Canvas>
      </div>

      <ChatView />
    </div>
  );
};

export default WorkflowCanvas;
