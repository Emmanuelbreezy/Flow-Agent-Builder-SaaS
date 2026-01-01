import { Node } from "@xyflow/react";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { replaceVariables } from "@/lib/helper";

export async function executeIfElse(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs } = context;
  const conditions =
    (node.data.conditions as Array<{ condition: string; caseName: string }>) ||
    [];

  if (!Array.isArray(conditions)) {
    throw new Error("Conditions must be an array");
  }

  for (const condition of conditions) {
    // Replace variables in condition
    const resolvedCondition = replaceVariables(condition.condition, outputs);

    try {
      // Evaluate condition
      const result = eval(resolvedCondition);
      if (result) {
        return {
          output: {
            result: true,
            branch: condition.caseName,
          },
        };
      }
    } catch (error) {
      console.error(
        `Condition evaluation error for "${condition.caseName}":`,
        error
      );
      throw new Error(
        `Condition evaluation error for "${condition.caseName}": ${error}`
      );
    }
  }

  return {
    output: {
      result: false,
      branch: "else",
    },
  };
}
