/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";
import { convertToModelMessages, streamText } from "ai";
import { openrouter } from "@/lib/openrouter";
//import { nanoid } from "nanoid";
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

  console.log("instructions", instructions, outputs);
  console.log("replacedInstructions", replacedInstructions);

  const modelMessages = await convertToModelMessages(history);

  console.log(
    JSON.stringify(modelMessages, null, 2),
    "-----convertToModelMessages"
  );

  // Stream AI response
  const result = streamText({
    model: openrouter.chat(model),
    system: replacedInstructions,
    messages: modelMessages,
    //tools: node.data.tools || {},
    ...(outputFormat === "json" &&
      responseSchema && {
        experimental_output: responseSchema,
      }),
  });

  const stream = result.toUIMessageStream({
    generateMessageId: () => crypto.randomUUID(),
    onFinish: async ({ messages }) => {
      for (const member of messages) {
        // await redis.zadd(`history:${id}`, { score: Date.now(), member });
        history.push(member);
      }
    },
  });

  // Stream chunks to channel
  for await (const chunk of stream) {
    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data?.name,
        status: "streaming",
        output: chunk,
      },
    });
  }

  const fullText = await result.text;

  console.log(fullText);

  // Add AI response to history for context in future nodes

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
