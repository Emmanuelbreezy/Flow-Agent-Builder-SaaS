/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Node, Edge } from "@xyflow/react";

export type WorkflowNodeType = Node & {
  nodeId: string;
};

export type WorkflowEdgeType = Edge;

export type ExecutorContextType = {
  outputs: Record<string, any>;
  channel: any; // Realtime instance - just use any to avoid type recursion
  history: Array<{ role: string; content: string }>;
  sessionId: string;
};

export type ExecutorResultType = {
  output: any;
};
