import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Node, Edge } from "@xyflow/react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id, userId: user.id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const flowObject = JSON.parse(workflow.flowObject);

    return NextResponse.json({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        flowObject: flowObject,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nodes, edges } = (await request.json()) as {
      nodes: Node[];
      edges: Edge[];
    };
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id, userId: user.id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        flowObject: JSON.stringify({ nodes, edges }),
      },
    });

    const updatedFlowObject = JSON.parse(updatedWorkflow.flowObject);

    return NextResponse.json({
      success: true,
      message: "Workflow updated successfully",
      data: {
        id: updatedWorkflow.id,
        name: updatedWorkflow.name,
        flowObject: updatedFlowObject,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      {
        error: `Failed to update workflow: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
