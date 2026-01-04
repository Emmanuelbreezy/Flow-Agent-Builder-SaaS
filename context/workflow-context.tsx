/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Node,
  Edge,
  useEdgesState,
  useNodesState,
  useViewport,
} from "@xyflow/react";

import { ToolModeType, TOOL_MODE_ENUM } from "@/lib/workflow/constants";

export type WorkflowView = "edit" | "preview";

interface WorkflowContextType {
  view: WorkflowView;
  setView: (view: WorkflowView) => void;
  toolMode: ToolModeType;
  setToolMode: (mode: ToolModeType) => void;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  getVariablesForNode: (
    nodeId: string
  ) => { nodeId: string; name: string; outputs?: any }[];
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

export function WorkflowProvider({
  workflowId,
  initialNodes,
  initialEdges,
  children,
}: {
  children: ReactNode;
  workflowId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}) {
  const [view, setView] = useState<WorkflowView>("edit");
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.HAND);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const [prevWorkflowId, setPrevWorkflowId] = useState(workflowId);
  if (workflowId !== prevWorkflowId) {
    setPrevWorkflowId(workflowId);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }

  // // Get start node config with all default properties
  // const startNodeConfig = NODE_CONFIG[NODE_TYPES.START];
  // const initialNodes: Node[] = [
  //   {
  //     id: generateId(NODE_TYPES.START),
  //     type: NODE_TYPES.START,
  //     position: { x: 100, y: 200 },
  //     deletable: false,
  //     data: {
  //       ...startNodeConfig.inputs,
  //       outputs: startNodeConfig.outputs,
  //       color: startNodeConfig.color,
  //     },
  //   },
  // ];

  // Get upstream node IDs
  const getUpstreamNodes = (nodeId: string): Set<string> => {
    const upstream = new Set<string>();
    const addToSet = (_id: string) => {
      edges
        .filter((e) => e.target === _id)
        .forEach((e) => {
          upstream.add(e.source);
          addToSet(e.source);
        });
    };
    addToSet(nodeId);
    return upstream;
  };

  // Get variables for a node (only from upstream)
  const getVariablesForNode = (nodeId: string) => {
    const upstreamIds = getUpstreamNodes(nodeId);
    return nodes
      .filter((n) => upstreamIds.has(n.id))
      .map((n) => ({
        nodeId: n.id,
        name: String(n.data.name || "Unnamed"),
        outputs: n.data.outputs || [], // ← Get from node data!
      }));
  };

  return (
    <WorkflowContext.Provider
      value={{
        view,
        setView,
        toolMode,
        setToolMode,
        nodes,
        edges,
        getVariablesForNode,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
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

//
//
//
//// Get upstream node IDs
// const getFilteredEdges = (nodeId: string): Set<string> => {
//   const upstream = new Set<string>();
//   const addToSet = (id: string) => {
//     edges
//       .filter((e) => e.target === id)
//       .forEach((e) => {
//         upstream.add(e.source);
//         addToSet(e.source);
//       });
//   };
//   addToSet(nodeId);
//   return upstream;
// };

// // Get variables for a node (only from upstream)
// const getVariablesForNode = (nodeId: string) => {
//   const edgeIds = getFilteredEdges(nodeId);
//   return nodes
//     .filter((n) => edgeIds.has(n.id))
//     .map((n) => ({
//       id: n.id,
//       name: String(
//         n.data.name ||
//           NODE_CONFIG[n.type as keyof typeof NODE_CONFIG]?.label ||
//           "Unnamed"
//       ),
//     }));
// };
// Track changes
// const [savedNodes, setSavedNodes] = useState<Node[]>(nodes);
// const [savedEdges, setSavedEdges] = useState<Edge[]>(edges);

// Check for changes - only data, ignore position/selection
// const hasUnsavedChanges = React.useMemo(() => {
//   const getNodeData = (list: Node[]) =>
//     list.map((n) => ({ id: n.id, type: n.type, data: n.data }));
//   const getEdgeData = (list: Edge[]) =>
//     list.map((e) => ({ source: e.source, target: e.target, id: e.id }));

//   const nodesChanged =
//     JSON.stringify(getNodeData(nodes)) !==
//     JSON.stringify(getNodeData(savedNodes));

//   const edgesChanged =
//     JSON.stringify(getEdgeData(edges)) !==
//     JSON.stringify(getEdgeData(savedEdges));

//   return nodesChanged || edgesChanged;
// }, [nodes, edges, savedNodes, savedEdges]);

// const saveChanges = () => {
//   setSavedNodes(nodes);
//   setSavedEdges(edges);
//   // TODO: Add API call to save to backend
//   console.log("Saving workflow changes...");
// };

// const discardChanges = () => {
//   setNodes(savedNodes);
//   setEdges(savedEdges);
// };
