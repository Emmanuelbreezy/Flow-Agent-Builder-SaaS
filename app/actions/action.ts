/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createMCPClient } from "@ai-sdk/mcp";
import { webSearch } from "@exalabs/ai-sdk";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { TOOLS } from "@/lib/workflow/constants";
import prisma from "@/lib/prisma";

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

//Mcp
export async function getMcpToolSet({
  url,
  apiKey,
}: {
  url: string;
  apiKey?: string;
}) {
  const client = await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  });
  const toolSet = await client.tools();
  await client.close();
  return toolSet; // raw object
}

export async function connectMcpServer({
  url,
  apiKey,
}: {
  url: string;
  apiKey?: string;
}) {
  const toolSet = await getMcpToolSet({ url, apiKey });
  const toolsArray = Object.entries(toolSet).map(([name, tool]) => ({
    name,
    description: tool.description || "",
    inputSchema: "",
  }));
  return { tools: toolsArray };
}

export async function addMcpServer({
  url,
  apiKey,
  label,
  userId,
}: {
  url: string;
  apiKey?: string;
  label: string;
  userId: string;
}) {
  // Connect and get tools
  const tools = await connectMcpServer({ url, apiKey });
  const encryptedKey = "<ENCRYPTED_API_KEY>";

  await prisma.mCPCredential.create({
    data: {
      userId,
      serverLabel: label,
      encryptedKey,
    },
  });

  return { tools };
}
