import { realtime } from "@/lib/ai/realtime";
import { redis } from "@/lib/ai/redis";
import { serve } from "@upstash/workflow/nextjs";
import { executeWorkflow } from "@/lib/workflow/execute-workflow";
import { Node, Edge } from "@xyflow/react";

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

export const { POST } = serve(async (workflow) => {
  const { nodes, edges, userInput } = workflow.requestPayload as {
    nodes: Node[];
    edges: Edge[];
    userInput: string;
  };

  const sessionId = crypto.randomUUID();
  const channel = realtime.channel(sessionId);

  await workflow.run("workflow-execution", async () => {
    try {
      await executeWorkflow(nodes, edges, userInput, channel, sessionId);

      // Store final result in Redis
      await redis.zadd(
        `history:${sessionId}`,
        { nx: true },
        {
          score: Date.now(),
          member: {
            id: sessionId,
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
