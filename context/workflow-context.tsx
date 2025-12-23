"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Edge, Node } from "@xyflow/react";
import { NODE_TYPES, TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
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
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: generateId(NODE_TYPES.START),
      type: NODE_TYPES.START,
      position: { x: 400, y: 200 },
      deletable: false,
      data: {
        label: "Start",
        description: "Workflow entry point",
        handles: { target: false, source: true },
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
