/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";
import { convertJsonSchemaToZod } from "zod-from-json-schema";
import { convertToModelMessages, Output, streamText } from "ai";
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
  const {
    instructions,
    outputFormat = "text",
    responseSchema,
    model: selectedModel,
  } = node.data as any;

  const model = selectedModel || MODELS[0].value;

  const systemPrompt = replaceVariables(instructions, outputs);
  const modelMessages = await convertToModelMessages(history);
  // 🔹 Only build Zod schema for JSON output
  const jsonOutput =
    outputFormat === "json" && responseSchema
      ? {
          output: Output.object({
            schema: convertJsonSchemaToZod(responseSchema),
          }),
        }
      : undefined;

  // Stream AI response
  const result = streamText({
    model: openrouter.chat(model),
    system: systemPrompt,
    messages: modelMessages,
    //tools: node.data.tools || {},
    ...jsonOutput,
  });

  if (outputFormat === "json") {
    try {
      const text = await result.text;
      return { output: JSON.parse(text) };
    } catch (error: any) {
      console.error("Failed to parse JSON response from agent:", error);
      await channel.emit("workflow.chunk", {
        type: "data-workflow-node",
        id: node.id,
        data: {
          id: node.id,
          nodeType: node.type,
          nodeName: node.data?.name,
          status: "error",
          error: "Invalid JSON output from agent",
        },
      });
      throw new Error("Agent returned invalid JSON");
    }
  }

  let fullText = "";
  for await (const chunk of result.textStream) {
    console.log(chunk, "chunk");
    fullText += chunk;

    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      id: node.id,
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data?.name,
        status: "loading",
        output: fullText,
      },
    });
  }

  return { output: { text: fullText } };
}

// const stream = result.toUIMessageStream({
//   generateMessageId: () => crypto.randomUUID(),
//   onFinish: async ({ messages }) => {
//     for (const member of messages) {
//       // await redis.zadd(`history:${id}`, { score: Date.now(), member });
//       history.push(member);
//     }
//   },
// });
