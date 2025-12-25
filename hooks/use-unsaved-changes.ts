// lib/hooks/useUnsavedChanges.ts
import { useMemo, useState, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean;
  saveChanges: () => void;
  discardChanges: () => void;
  reset: () => void;
}

export function useUnsavedChanges({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}): UseUnsavedChangesReturn {
  const [savedState, setSavedState] = useState({ nodes, edges });

  // Check for changes - only data, ignore position/selection
  const hasUnsavedChanges = useMemo(() => {
    const nodeData = (list: Node[]) =>
      list.map((n) => ({ id: n.id, type: n.type, data: n.data }));
    const edgeData = (list: Edge[]) =>
      list.map((e) => ({ source: e.source, target: e.target, id: e.id }));

    return (
      JSON.stringify(nodeData(nodes)) !==
        JSON.stringify(nodeData(savedState.nodes)) ||
      JSON.stringify(edgeData(edges)) !==
        JSON.stringify(edgeData(savedState.edges))
    );
  }, [nodes, edges, savedState]);

  const saveChanges = useCallback(() => {
    setSavedState({ nodes, edges });
  }, [nodes, edges]);

  const discardChanges = useCallback(() => {
    return savedState; // Return saved state to restore
  }, [savedState]);

  const reset = useCallback(() => {
    setSavedState({ nodes, edges });
  }, [nodes, edges]);

  return {
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    reset,
  };
}
