/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";
import { convertJsonSchemaToZod } from "zod-from-json-schema";
import { convertToModelMessages, Output } from "ai";
import { replaceVariables } from "@/lib/helper";
import { MODELS } from "@/lib/workflow/constants";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { streamAgentAction } from "@/app/actions/action";

// Dynamic import for Tavily (server-side only)

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

  const replacedInstructions = replaceVariables(instructions, outputs);
  // Build tools object here

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

  const result = await streamAgentAction({
    model,
    instructions: replacedInstructions,
    history,
    jsonOutput,
    selectedTools,
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
            toolResult: {
              name: chunk.toolName,
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

//  case "reasoning-delta":
//         await channel.emit("workflow.chunk", {
//           type: "data-workflow-node",
//           id: node.id,
//           data: {
//             id: node.id,
//             nodeType: node.type,
//             nodeName: node.data?.name,
//             status: "loading",
//             reasoningDelta: {},
//           },
//         });
//  <Reasoning
//                             key={`${message.id}-${i}`}
//                             className="w-full"
//                             isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
//                           >
//                             <ReasoningTrigger />
//                             <ReasoningContent>{part.text}</ReasoningContent>
//                           </Reasoning>
// const result = streamText({
//   model: openrouter.chat(model),
//   system: systemPrompt,
//   messages: modelMessages,
//   //tools: Object.keys(tools).length > 0 ? tools : undefined,
//   stopWhen: stepCountIs(3),
//   ...jsonOutput,
// });

// const stream = result.toUIMessageStream({
//   generateMessageId: () => crypto.randomUUID(),
//   onFinish: async ({ messages }) => {
//     for (const member of messages) {
//       // await redis.zadd(`history:${id}`, { score: Date.now(), member });
//       history.push(member);
//     }
//   },
// });
