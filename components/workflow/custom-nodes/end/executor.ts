import { Node } from "@xyflow/react";
import { ExecutorContext, ExecutorResult } from "@/lib/workflow/type";

export async function executeEnd(
  node: Node,
  context: ExecutorContext
): Promise<ExecutorResult> {
  const text = node.data.value as string;

  return {
    output: {
      text,
      completed: true,
    },
  };
}
