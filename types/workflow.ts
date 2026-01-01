/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkflowContext } from "@upstash/workflow";
import { UIMessage } from "ai";

export type ExecutorContextType = {
  outputs: Record<string, any>;
  history: UIMessage[];
  workflowRunId: string;
  channel: any; // Realtime instance - just use any to avoid type recursion
  workflowContext: WorkflowContext;
};

export type ExecutorResultType = {
  output: any;
};
