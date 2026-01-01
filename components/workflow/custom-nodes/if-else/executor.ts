import { Node } from "@xyflow/react";
import { Parser } from "expr-eval";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { replace_Variables, replaceVariables } from "@/lib/helper";

export async function executeIfElse(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs } = context;
  const conditions =
    (node.data.conditions as Array<{ condition: string; caseName: string }>) ||
    [];

  console.log(conditions, "conditons");
  console.log(outputs, "outputs");

  if (!Array.isArray(conditions)) {
    throw new Error("Conditions must be an array");
  }

  for (const condition of conditions) {
    // Replace variables in condition
    console.log(condition.condition, "condition.condition, outputs");
    const resolvedCondition = replace_Variables(condition.condition, outputs);
    // Not recommended, but fixes the immediate string error

    console.log(resolvedCondition, "resolvedCondition");

    try {
      // Evaluate condition
      // Use expr-eval instead of eval
      const parser = new Parser();
      const result = parser.evaluate(resolvedCondition);

      console.log(result, "conditons result");

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
