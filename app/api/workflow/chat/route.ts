import { realtime } from "@/lib/realtime";
import { serve } from "@upstash/workflow/nextjs";
import { executeWorkflow } from "@/lib/workflow/execute-workflow";
import { Node, Edge } from "@xyflow/react";
import { UIMessage } from "ai";
import prisma from "@/lib/prisma";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (!id) return new Response("ID is required.");
  console.log(id, "SSE chat id");

  const channel = realtime.channel(id);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      await channel.subscribe({
        events: ["workflow.chunk"],
        history: true, // <-- This streams both history and new events!
        onData({ event, data, channel }) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          if (data.type === "finish") controller.close();
        },
      });

      req.signal.addEventListener("abort", () => {
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
};

export const { POST } = serve(async (ctx) => {
  const { workflowId, messages } = ctx.requestPayload as {
    workflowId: string;
    messages: UIMessage[];
  };
  const workflowRunId = ctx.workflowRunId;
  const channel = realtime.channel(workflowRunId);
  const message = messages[messages.length - 1];
  const userInput =
    message.role === "user" && message.parts[0].type === "text"
      ? message.parts[0].text
      : "";

  const { nodes, edges } = await ctx.run("fetch-database", async () => {
    const workflowData = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });
    if (!workflowData) throw new Error("Workflow not found");
    const obj = JSON.parse(workflowData.flowObject);
    const nodes = obj.nodes as Node[];
    const edges = obj.edges as Edge[];
    return { nodes, edges };
  });

  await ctx.run("workflow-execution", async () => {
    try {
      // const workflowData = await prisma.workflow.findUnique({
      //   where: { id: workflowId },
      // });
      // if (!workflowData) throw new Error("Workflow not found");
      // const obj = JSON.parse(workflowData.flowObject);
      // const nodes = obj.nodes as Node[];
      // const edges = obj.edges as Edge[];
      await executeWorkflow(
        nodes,
        edges,
        userInput,
        messages,
        channel,
        workflowRunId
      );
    } catch (error) {
      console.error("Workflow execution error:", error);
      throw error;
    }
  });
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// await ctx.run("workflow-execution", async () => {
//   const workflowData = await prisma.workflow.findUnique({
//     where: { id: workflowId },
//   });
//   if (!workflowData) throw new Error("Workflow not found");
//   const obj = JSON.parse(workflowData.flowObject);
//   const nodes = obj.nodes as Node[];
//   const edges = obj.edges as Edge[];

//   console.log(nodes, edges, "nodes, edges");

//   // const result = await executeWorkflow(
//   //   nodes,
//   //   edges,
//   //   userInput,
//   //   messages,
//   //   channel,
//   //   workflowRunId
//   // );
// });
