/* eslint-disable @typescript-eslint/no-explicit-any */

export type ExecutorContextType = {
  outputs: Record<string, any>;
  channel: any; // Realtime instance - just use any to avoid type recursion
  history: Array<{ role: string; content: string }>;
  sessionId: string;
};

export type ExecutorResultType = {
  output: any;
};
