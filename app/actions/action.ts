/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { webSearch } from "@exalabs/ai-sdk";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { TOOLS } from "@/lib/workflow/constants";

export async function streamAgentAction({
  model,
  instructions,
  history,
  jsonOutput,
  selectedTools,
}: {
  model: string;
  instructions: string;
  history: UIMessage[];
  jsonOutput: any;
  selectedTools: string[];
}) {
  const modelMessages = await convertToModelMessages(history);

  const setTools: Record<string, any> = {};
  if (selectedTools.includes("webSearch")) {
    setTools.webSearch = webSearch();
  }
  const tools = Object.keys(setTools).length > 0 ? setTools : undefined;

  // Build tool list text
  const toolListText = TOOLS.filter((t) => selectedTools.includes(t.id))
    .map((t) => `- ${t.id}: ${t.description}`)
    .join("\n");

  // Find the last user message
  const lastUserMsg = [...modelMessages]
    .reverse()
    .find((msg) => msg.role === "user");
  const lastUserQuestion = lastUserMsg?.content ?? "";

  // Platform system prompt
  const platformPrompt = `You are a helpful assistant. Always answer the last question from the user: "${lastUserQuestion}". **Must Use the following instructions: "${instructions}".${
    tools
      ? `\n\nAvailable tools:\n${toolListText}\n\nCall a tool by emitting a tool_call event if needed.`
      : ""
  }`;

  const result = streamText({
    model: openrouter.chat(model),
    system: platformPrompt,
    messages: modelMessages,
    tools: tools,
    stopWhen: stepCountIs(3),
    ...jsonOutput,
  });
  return result;
}
