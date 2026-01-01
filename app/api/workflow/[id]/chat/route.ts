import { realtime, redis } from "@/lib/realtime";
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

  // const stream = new ReadableStream({
  //   async start(controller) {
  //     const historyMessages = await channel.history();
  //     for (const chunk of historyMessages) {
  //       if (chunk.event === "workflow.chunk") {
  //         controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
  //         console.log(chunk.data, "data");
  //         if (
  //           chunk.data &&
  //           typeof chunk.data === "object" &&
  //           "type" in chunk.data &&
  //           (chunk.data as { type?: string }).type === "finish"
  //         ) {
  //           controller.close();
  //         }
  //       }
  //     }
  //   },
  // });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      await channel.subscribe({
        events: ["workflow.chunk"],
        //history: true, // <-- This streams both history and new events!
        onData({ event, data, channel }) {
          console.log(data, "data", "data");
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

export const { POST } = serve(async (workflowContext) => {
  const { workflowId, messages } = workflowContext.requestPayload as {
    workflowId: string;
    id: string;
    messages: UIMessage[];
  };
  const workflowRunId = workflowContext.workflowRunId;
  console.log(workflowContext.workflowRunId, "workflowContext .workflowRunId");

  console.log("- -------------- -------   ");

  const channel = realtime.channel(workflowRunId);
  const message = messages[messages.length - 1];
  const userInput =
    message.role === "user" && message.parts[0].type === "text"
      ? message.parts[0].text
      : "";

  const score = Date.now();
  await redis.zadd(
    `history:${workflowId}`,
    { nx: true },
    { score, member: message }
  );

  await workflowContext.run("workflow-execution", async () => {
    try {
      const workflowData = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });
      if (!workflowData) throw new Error("Workflow not found");
      const obj = JSON.parse(workflowData.flowObject);
      const nodes = obj.nodes as Node[];
      const edges = obj.edges as Edge[];

      // console.log(nodes, edges, "nodes, edges");

      await executeWorkflow(
        nodes,
        edges,
        userInput,
        messages,
        channel,
        workflowRunId,
        workflowContext
      );

      // // Store final result in Redis
      await redis.zadd(
        `history:${workflowRunId}`,
        { nx: true },
        {
          score: Date.now(),
          member: {
            id: workflowRunId,
            type: "workflow-result",
          },
        }
      );
    } catch (error) {
      console.error("Workflow execution error:", error);
      throw error;
    }
  });
});
