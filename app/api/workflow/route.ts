import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createNode, NodeTypeEnum } from "@/lib/workflow/node-config";

export async function GET() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const userId = user.id;
    const startNode = createNode({
      type: NodeTypeEnum.START,
    });

    const flowObject = {
      nodes: [
        {
          id: startNode.id,
          type: startNode.type,
          position: startNode.position,
          data: startNode.data,
          deletable: false,
        },
      ],
      edges: [],
    };

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description: description || "",
        flowObject: JSON.stringify(flowObject),
      },
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      {
        error: `Failed to create workflow`,
      },
      { status: 500 }
    );
  }
}
