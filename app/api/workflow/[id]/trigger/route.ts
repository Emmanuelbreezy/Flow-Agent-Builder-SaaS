import { Client } from "@upstash/workflow";
import { NextRequest, NextResponse } from "next/server";

const client = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest) {
  const { workflowId, messages } = await request.json();

  try {
    const result = await client.trigger({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/${workflowId}/chat`,
      body: {
        workflowId,
        id: crypto.randomUUID(),
        messages,
      },
      retries: 3,
      keepTriggerConfig: true,
    });

    return NextResponse.json({
      success: true,
      workflowRunId: result.workflowRunId,
    });
  } catch (error) {
    console.error("Trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger workflow" },
      { status: 500 }
    );
  }
}
