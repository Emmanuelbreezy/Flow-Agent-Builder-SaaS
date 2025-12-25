/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Edge, Node } from "@xyflow/react";
import {
  NODE_TYPES,
  TOOL_MODE_ENUM,
  ToolModeType,
  NODE_CONFIG,
  NodeType,
} from "@/lib/workflow/node-config";
import { generateId } from "@/lib/helper";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

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
  getVariablesForNode: (
    nodeId: string
  ) => { id: string; name: string; outputSchema?: any }[];
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

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
        outputSchema: startNodeConfig.defaultOutputSchema,
        color: startNodeConfig.color,
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Use the hook for tracking changes
  const { hasUnsavedChanges, saveChanges, discardChanges } = useUnsavedChanges({
    nodes,
    edges,
  });

  // Get upstream node IDs
  const getUpstreamNodes = (nodeId: string): Set<string> => {
    const upstream = new Set<string>();
    const addToSet = (id: string) => {
      edges
        .filter((e) => e.target === id)
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
        id: n.id,
        name: String(
          n.data.name || NODE_CONFIG[n.type as NodeType]?.label || "Unnamed"
        ),
        outputSchema: n.data.outputSchema || [], // ← Get from node data!
      }));
  };

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
        hasUnsavedChanges,
        saveChanges,
        discardChanges,
        getVariablesForNode,
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
