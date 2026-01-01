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
  const instructions = node.data.instructions as string;
  const outputFormat = node.data.outputFormat as "text" | "json";
  const responseSchema = node.data.responseSchema as any;
  const model = (node.data.model as string) || MODELS[0].value;

  const zodSchema = convertJsonSchemaToZod(responseSchema);

  // Replace variables in instructions
  const replacedInstructions = replaceVariables(instructions, outputs);

  console.log("instructions", instructions, outputs);
  console.log("replacedInstructions", replacedInstructions);

  const modelMessages = await convertToModelMessages(history);

  // Stream AI response
  const result = streamText({
    model: openrouter.chat(model),
    system: replacedInstructions,
    messages: modelMessages,
    //tools: node.data.tools || {},
    ...(outputFormat === "json" &&
      responseSchema && {
        output: Output.object({ schema: zodSchema }),
      }),
  });

  const res_text = await result.text;
  console.log("Streaming result text", res_text, "----");

  if (outputFormat === "json") {
    try {
      const fullResult = await result.text;
      console.log("Full JSON response from agent:", fullResult, "---------");
      const parsed = JSON.parse(fullResult);
      console.log("Parsed JSON response from agent:", parsed);
      return { output: parsed };
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
          error: error.message || "Failed to parse JSON response from agent",
        },
      });
      throw new Error("Failed to parse JSON response from agent");
    }
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

  let fullText = "";
  // Stream chunks to channel
  for await (const chunk of result.textStream) {
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
