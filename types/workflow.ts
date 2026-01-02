/* eslint-disable @typescript-eslint/no-explicit-any */
import { UIMessage } from "ai";

export type ExecutorContextType = {
  outputs: Record<string, any>;
  history: UIMessage[];
  workflowRunId: string;
  channel: any; // Realtime instance - just use any to avoid type recursion
};

export type ExecutorResultType = {
  output: any;
};
