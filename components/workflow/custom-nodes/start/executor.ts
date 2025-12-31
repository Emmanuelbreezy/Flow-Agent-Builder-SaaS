import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";

export async function executeStart(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  // Start node just passes through the input
  return {
    output: context.outputs.start.input,
  };
}
