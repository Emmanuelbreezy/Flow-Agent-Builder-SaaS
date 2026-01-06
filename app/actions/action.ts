/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createMCPClient } from "@ai-sdk/mcp";
import { webSearch } from "@exalabs/ai-sdk";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { decrypt, encrypt } from "@/lib/helper";

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
  selectedTools: Array<
    | { type: "native"; value: string }
    | { type: "mcp"; serverId: string; tools: Array<{ name: string }> }
  >;
}) {
  const modelMessages = await convertToModelMessages(history);
  const tools: Record<string, any> = {};
  const mcpClients: any[] = [];

  // Native tools
  for (const t of selectedTools.filter((t) => t.type === "native")) {
    if (t.value === "webSearch") tools.webSearch = webSearch();
  }

  // MCP tools
  for (const t of selectedTools.filter((t) => t.type === "mcp")) {
    const { toolSet, client } = await getMcpToolsByServerId(t.serverId);
    mcpClients.push(client); // Save client for later
    for (const tool of t.tools) {
      if (toolSet[tool.name]) tools[tool.name] = toolSet[tool.name];
    }
  }

  const toolList = Object.entries(tools)
    ?.map(([name]) => `- ${name}`)
    ?.join("\n");

  const systemPrompt = `You are a helpful assistant.
IMPORTANT: Only respond to the user's MOST RECENT message. Do NOT repeat or re-answer previous questions from the conversation history. The history is provided for context only.
**Must Use the following instructions:
${instructions}

${toolList ? `Available tools:\n${toolList}` : ""}`.trim();

  const result = streamText({
    model: openrouter.chat(model),
    system: systemPrompt,
    messages: modelMessages,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(5),
    //Optional
    // providerOptions: {
    //   gemini: {
    //     reasoningSummary: "auto",
    //   },
    // },
    ...jsonOutput,

    onFinish: async () => {
      console.log("Stream finished");
      for (const client of mcpClients) {
        await client.close();
      }
    },
  });

  return result;
}

export async function getMcpToolsByServerId(serverId: string) {
  const server = await prisma.mcpServer.findUnique({
    where: { id: serverId },
  });
  if (!server) throw new Error("MCP server not found");

  const apiKey = server.token ? decrypt(server.token) : undefined;
  const url = server.url;
  const client = await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  });

  const toolSet = await client.tools();
  return { toolSet, client }; // raw object, or map to array if needed
}

export async function connectMcpServer({
  url,
  apiKey,
}: {
  url: string;
  apiKey?: string;
}) {
  if (!url) throw new Error("MCP server URL is required");
  const client = await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  });
  const toolSet = await client.tools();
  const toolsArray = Object.entries(toolSet).map(([name, tool]) => ({
    name,
    description: tool.description || "",
  }));
  await client.close();
  return { tools: toolsArray };
}

export async function addMcpServer({
  url,
  apiKey,
  label,
}: {
  url: string;
  apiKey: string;
  label: string;
}) {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check for existing server
  let server = await prisma.mcpServer.findFirst({
    where: { userId: user.id, url },
  });

  const encryptedKey = apiKey ? encrypt(apiKey) : "";
  if (!server) {
    server = await prisma.mcpServer.create({
      data: {
        userId: user.id,
        label,
        url,
        token: encryptedKey,
      },
    });
  } else {
    // Update the API key and label/approval if needed
    server = await prisma.mcpServer.update({
      where: { id: server.id },
      data: {
        label,
        token: encryptedKey,
      },
    });
  }

  return { serverId: server.id };
}

//old without mcp
// export async function streamAgentAction({
//   model,
//   instructions,
//   history,
//   jsonOutput,
//   selectedTools,
// }: {
//   model: string;
//   instructions: string;
//   history: UIMessage[];
//   jsonOutput: any;
//   selectedTools: string[]
// }) {
//   const modelMessages = await convertToModelMessages(history);

//   const setTools: Record<string, any> = {};
//   if (selectedTools.includes("webSearch")) {
//     setTools.webSearch = webSearch();
//   }
//   const tools = Object.keys(setTools).length > 0 ? setTools : undefined;

//   // Build tool list text
//   const toolListText = TOOLS.filter((t) => selectedTools.includes(t.id))
//     .map((t) => `- ${t.id}: ${t.description}`)
//     .join("\n");

//   // Find the last user message
//   const lastUserMsg = [...modelMessages]
//     .reverse()
//     .find((msg) => msg.role === "user");
//   const lastUserQuestion = lastUserMsg?.content ?? "";

//   // Platform system prompt
//   const platformPrompt = `You are a helpful assistant. Always answer the last question from the user: "${lastUserQuestion}". **Must Use the following instructions: "${instructions}".${
//     tools
//       ? `\n\nAvailable tools:\n${toolListText}\n\nCall a tool by emitting a tool_call event if needed.`
//       : ""
//   }`;

//   const result = streamText({
//     model: openrouter.chat(model),
//     system: platformPrompt,
//     messages: modelMessages,
//     tools: tools,
//     stopWhen: stepCountIs(3),
//     ...jsonOutput,
//   });
//   return result;
// }

//
//
//
//
//Mcp
// export async function getMcpToolSet({
//   url,
//   apiKey,
// }: {
//   url: string;
//   apiKey?: string;
// }) {
//   const client = await createMCPClient({
//     transport: {
//       type: "http",
//       url,
//       headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
//     },
//   });
//   const toolSet = await client.tools();
//   await client.close();
//   return toolSet; // raw object
// }
