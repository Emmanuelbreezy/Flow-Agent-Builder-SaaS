/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { tavilyExtract, tavilySearch } from "@tavily/ai-sdk";

const webSearch = tavilySearch({
  apiKey: process.env.TAVILY_API_KEY!,
  searchDepth: "advanced",
  topic: "general",
});
const webExtract = tavilyExtract({
  apiKey: process.env.TAVILY_API_KEY!,
});

export async function getTools(selectedTools: string[]) {
  const tools: Record<string, any> = {};
  for (const toolId of selectedTools) {
    if (toolId === "webSearch") {
      tools.webSearch = webSearch;
    } else if (toolId === "webExtract") {
      tools.webExtract = webExtract;
    }
  }
  return tools;
}

export async function streamAgentAction({
  model,
  systemPrompt,
  history,
  jsonOutput,
  selectedTools,
}: {
  model: string;
  systemPrompt: string;
  history: UIMessage[];
  jsonOutput: any;
  selectedTools: string[];
}) {
  const modelMessages = await convertToModelMessages(history);

  const tools = await getTools(selectedTools);

  const result = streamText({
    model: openrouter.chat(model),
    system: systemPrompt,
    messages: modelMessages,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(3),
    ...jsonOutput,
  });
  return result;
}
