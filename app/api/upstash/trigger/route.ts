import { Client } from "@upstash/workflow";
import { NextRequest, NextResponse } from "next/server";

const client = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3000`;

export async function POST(request: NextRequest) {
  const { workflowId, messages } = await request.json();

  console.log("Triggering workflow:", workflowId);

  try {
    const result = await client.trigger({
      url: `${BASE_URL}/api/workflow/chat`,
      body: {
        workflowId,
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
