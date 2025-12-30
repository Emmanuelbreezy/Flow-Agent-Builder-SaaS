import { ExecutorContext, ExecutorResult } from "@/lib/workflow/type";

export async function executeStart(
  node: Node,
  context: ExecutorContext
): Promise<ExecutorResult> {
  // Start node just passes through the input
  return {
    output: context.outputs.start.input,
  };
}
