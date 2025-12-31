/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";
import { streamText } from "ai";
import { openrouter } from "@/lib/ai/openrouter";

import { replaceVariables } from "@/lib/helper";
import { MODELS } from "@/lib/workflow/constants";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";

export async function executeAgent(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs, channel, history } = context;
  const instructions = node.data.instructions as string;
  const outputFormat = node.data.outputFormat as "text" | "json";
  const responseSchema = node.data.responseSchema as any;
  const model = (node.data.model as string) || MODELS[0].value;

  // Replace variables in instructions
  const replacedInstructions = replaceVariables(instructions, outputs);

  // Build messages
  const messages = [...history];
  messages.push({ role: "user", content: replacedInstructions });

  // Stream AI response
  const result = streamText({
    model: openrouter.chat(model),
    messages,
    tools: node.data.tools || {},
    ...(outputFormat === "json" &&
      responseSchema && {
        experimental_output: responseSchema,
      }),
  });

  let fullText = "";

  // Stream chunks to channel
  for await (const chunk of result.textStream) {
    fullText += chunk;
    await channel.emit("workflow.chunk", {
      type: "text",
      text: chunk,
      data: {
        id: node.id,
        nodeType: node.type,
      },
    });
  }

  // Return based on output format
  if (node.data.outputFormat === "json") {
    try {
      const parsed = JSON.parse(fullText);
      return { output: parsed };
    } catch (error: any) {
      console.error("Failed to parse JSON response from agent:", error);
      throw new Error("Failed to parse JSON response from agent");
    }
  }

  return { output: { text: fullText } };
}
