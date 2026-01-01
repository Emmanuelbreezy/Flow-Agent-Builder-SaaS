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

  const channel = realtime.channel(id);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      // Subscribe properly (server side)
      await channel.subscribe({
        events: ["workflow.chunk"], // must be array
        onData({ data }) {
          // data IS UIMessageChunk
          console.log(data, "data");
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          // Close stream on finish
          if (data.type === "finish") {
            controller.close();
          }
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
      "Cache-Control": "no-cache",
    },
  });
};

export const { POST } = serve(async (workflowContext) => {
  const { workflowId, messages } = workflowContext.requestPayload as {
    workflowId: string;
    id: string;
    messages: UIMessage[];
  };
  console.log(workflowId, messages, "messages");
  console.log(workflowContext.workflowRunId, "workflowContext .workflowRunId");
  //const workflowRunId = context.workflowRunId;

  const workflowRunId = workflowContext.workflowRunId;
  const channel = realtime.channel(workflowRunId);
  const message = messages[messages.length - 1];
  const userInput =
    message.role === "user" && message.parts[0].type === "text"
      ? message.parts[0].text
      : "";

  await workflowContext.run("workflow-execution", async () => {
    try {
      const workflowData = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });
      if (!workflowData) throw new Error("Workflow not found");
      const obj = JSON.parse(workflowData.flowObject);
      const nodes = obj.nodes as Node[];
      const edges = obj.edges as Edge[];

      console.log(nodes, edges, "nodes, edges");

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
      // await redis.zadd(
      //   `history:${chatId}`,
      //   { nx: true },
      //   {
      //     score: Date.now(),
      //     member: {
      //       id: chatId,
      //       type: "workflow-result",
      //     },
      //   }
      // );
    } catch (error) {
      console.error("Workflow execution error:", error);
      throw error;
    }
  });
});
