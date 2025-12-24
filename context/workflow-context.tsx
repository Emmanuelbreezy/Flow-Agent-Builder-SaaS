"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Edge, Node } from "@xyflow/react";
import {
  NODE_TYPES,
  TOOL_MODE_ENUM,
  ToolModeType,
  NODE_CONFIG,
} from "@/constant/canvas";
import { generateId } from "@/lib/utils";

export type WorkflowView = "edit" | "preview" | "playground";

interface WorkflowContextType {
  view: WorkflowView;
  setView: (view: WorkflowView) => void;
  toolMode: ToolModeType;
  setToolMode: (mode: ToolModeType) => void;
  workflowId: string;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  hasUnsavedChanges: boolean;
  saveChanges: () => void;
  discardChanges: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

// const initialNodes: Node[] = [
//   {
//     id: nanoid(),
//     type: NODE_TYPES.START,
//     position: { x: 0, y: 100 },
//     data: {
//       label: "Start",
//       description: "Workflow entry point",
//       handles: { target: false, source: true },
//     },
//   },
//   {
//     id: nanoid(),
//     type: NODE_TYPES.AGENT,
//     position: { x: 400, y: 100 },
//     data: {
//       label: "AI Agent",
//       description: "Process user request",
//       prompt: "You are a helpful assistant that analyzes user sentiment.",
//     },
//   },
//   {
//     id: nanoid(),
//     type: NODE_TYPES.IF_ELSE,
//     position: { x: 750, y: 100 },
//     data: {
//       label: "Condition",
//       conditions: [
//         "input.sentiment == 'positive'",
//         "input.sentiment == 'negative'",
//       ],
//     },
//   },
//   {
//     id: nanoid(),
//     type: NODE_TYPES.USER_APPROVAL,
//     position: { x: 1150, y: 100 },
//     data: {
//       label: "User approval",
//       options: ["Approve", "Reject"],
//     },
//   },
// ];

// const initialEdges: Edge[] = [];

export function WorkflowProvider({
  children,
  workflowId,
}: {
  children: ReactNode;
  workflowId: string;
}) {
  const [view, setView] = useState<WorkflowView>("edit");
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.HAND);

  // Get start node config with all default properties
  const startNodeConfig = NODE_CONFIG[NODE_TYPES.START];

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: generateId(NODE_TYPES.START),
      type: NODE_TYPES.START,
      position: { x: 400, y: 200 },
      deletable: false,
      data: {
        ...startNodeConfig.defaultData,
        color: startNodeConfig.color,
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Track changes
  const [savedNodes, setSavedNodes] = useState<Node[]>(nodes);
  const [savedEdges, setSavedEdges] = useState<Edge[]>(edges);

  // Check for changes using useMemo
  const hasUnsavedChanges = React.useMemo(() => {
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(savedNodes);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(savedEdges);
    return nodesChanged || edgesChanged;
  }, [nodes, edges, savedNodes, savedEdges]);

  const saveChanges = () => {
    setSavedNodes(nodes);
    setSavedEdges(edges);
    // TODO: Add API call to save to backend
    console.log("Saving workflow changes...");
  };

  const discardChanges = () => {
    setNodes(savedNodes);
    setEdges(savedEdges);
  };

  // const updateNodeData = useCallback(
  //   (nodeId: string, data: Record<string, unknown>) => {
  //     setNodes((nds) =>
  //       nds.map((node) =>
  //         node.id === nodeId
  //           ? { ...node, data: { ...node.data, ...data } }
  //           : node
  //       )
  //     );
  //   },
  //   []
  // );

  return (
    <WorkflowContext.Provider
      value={{
        view,
        setView,
        toolMode,
        setToolMode,
        workflowId,
        nodes,
        edges,
        setNodes,
        setEdges,
        hasUnsavedChanges,
        saveChanges,
        discardChanges,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
