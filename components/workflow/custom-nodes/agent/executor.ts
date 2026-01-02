/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";
import { tavilySearch, tavilyExtract } from "@tavily/ai-sdk";
import { convertJsonSchemaToZod } from "zod-from-json-schema";
import { convertToModelMessages, Output, stepCountIs, streamText } from "ai";
import { openrouter } from "@/lib/openrouter";
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
    tools: selectedTools = [],
  } = node.data as any;
  const model = selectedModel || MODELS[0].value;

  const systemPrompt = replaceVariables(instructions, outputs);
  const modelMessages = await convertToModelMessages(history);

  // Build tools object
  const tools: Record<string, any> = {};

  for (const toolId of selectedTools) {
    if (toolId === "webSearch") {
      tools.webSearch = tavilySearch({
        apiKey: process.env.TAVILY_API_KEY,
      });
    } else if (toolId === "webExtract") {
      tools.webExtract = tavilyExtract({
        apiKey: process.env.TAVILY_API_KEY,
      });
    }
  }

  //
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
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(3),
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
  // for await (const chunk of result.textStream) {
  //   fullText += chunk;

  //   await channel.emit("workflow.chunk", {
  //     type: "data-workflow-node",
  //     id: node.id,
  //     data: {
  //       id: node.id,
  //       nodeType: node.type,
  //       nodeName: node.data?.name,
  //       status: "loading",
  //       output: fullText,
  //     },
  //   });
  // }

  // Stream all events
  for await (const chunk of result.fullStream) {
    switch (chunk.type) {
      case "text-delta":
        fullText += chunk.text;
        await channel.emit("workflow.chunk", {
          type: "data-workflow-node",
          id: node.id,
          data: {
            id: node.id,
            nodeType: node.type,
            nodeName: node.data?.name,
            status: "loading",
            contentType: "text",
            output: fullText,
          },
        });
        break;

      case "tool-call":
        await channel.emit("workflow.chunk", {
          type: "data-workflow-node",
          id: node.id,
          data: {
            id: node.id,
            nodeType: node.type,
            nodeName: node.data?.name,
            status: "loading",
            contentType: "tool-call",
            toolCall: {
              name: chunk.toolName,
            },
          },
        });
        break;

      case "tool-result":
        await channel.emit("workflow.chunk", {
          type: "data-workflow-node",
          id: node.id,
          data: {
            id: node.id,
            nodeType: node.type,
            nodeName: node.data?.name,
            status: "loading",
            contentType: "tool-result",
            toolResult: {
              name: chunk.toolName,
              result: chunk.output,
            },
          },
        });
        break;
    }
  }

  return { output: { text: fullText } };
}

//
//
//
//
//
//
//
//
//

// const stream = result.toUIMessageStream({
//   generateMessageId: () => crypto.randomUUID(),
//   onFinish: async ({ messages }) => {
//     for (const member of messages) {
//       // await redis.zadd(`history:${id}`, { score: Date.now(), member });
//       history.push(member);
//     }
//   },
// });
