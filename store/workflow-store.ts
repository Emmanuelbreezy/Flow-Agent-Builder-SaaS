import { create } from "zustand";
import { WorkflowNodeType, WorkflowEdgeType } from "@/types/workflow";

interface WorkflowStoreState {
  // Saved state from database
  savedNodes: WorkflowNodeType[];
  savedEdges: WorkflowEdgeType[];
  // Actions
  setSavedState: (nodes: WorkflowNodeType[], edges: WorkflowEdgeType[]) => void;
  resetSavedState: () => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set) => ({
  savedNodes: [],
  savedEdges: [],
  setSavedState: (nodes, edges) =>
    set({
      savedNodes: nodes,
      savedEdges: edges,
    }),
  resetSavedState: () =>
    set({
      savedNodes: [],
      savedEdges: [],
    }),
}));
