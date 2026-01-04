import { Node } from "@xyflow/react";
import { Parser } from "expr-eval";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { replaceVariables } from "@/lib/helper";

interface Condition {
  caseName?: string;
  variable?: string;
  operator?: string;
  value?: string;
}

export async function executeIfElse(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs } = context;
  const conditions = (node.data.conditions as Condition[]) || [];

  function needsQuoting(val: string) {
    // Checks if val does not already start and end with a quote
    return isNaN(Number(val)) && !/^["'].*["']$/.test(val);
  }

  if (!Array.isArray(conditions)) {
    throw new Error("Conditions must be an array");
  }
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    if (
      !condition.variable ||
      !condition.operator ||
      condition.value === undefined
    )
      continue;

    // Replace variables in variable and value fields
    const variable = replaceVariables(condition.variable, outputs).trim();
    const value = replaceVariables(condition.value, outputs).trim();

    // If variable is a string and not a number, quote it
    const variableExpr = needsQuoting(variable)
      ? JSON.stringify(variable)
      : variable;
    const valueExpr = needsQuoting(value) ? JSON.stringify(value) : value;

    // Merge variable and value expressions
    const expr = `${variableExpr} ${condition.operator} ${valueExpr}`;

    try {
      // Evaluate condition
      // Use expr-eval instead of eval
      const parser = new Parser();
      const result = parser.evaluate(expr);

      if (result) {
        return {
          output: {
            result: true,
            selectedBranch: `condition-${i}`,
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
      selectedBranch: "else",
    },
  };
}
