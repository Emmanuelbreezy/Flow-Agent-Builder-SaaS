import { Node } from "@xyflow/react";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";

export async function executeEnd(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const text = node.data.value as string;

  return {
    output: {
      text,
      completed: true,
    },
  };
}
