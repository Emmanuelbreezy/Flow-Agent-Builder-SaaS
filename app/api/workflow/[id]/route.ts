/* eslint-disable @typescript-eslint/no-explicit-any */
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
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }
    // Convert Prisma nodes to React Flow Node format
    const nodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      nodeId: node.nodeId,
      type: node.type,
      position: node.position as { x: number; y: number },
      deletable: node.deletable,
      data: node.data as Record<string, any>,
    }));

    // Convert Prisma edges to React Flow Edge format
    const edges: Edge[] = workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        userId: workflow.userId,
        nodes,
        edges,
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

// export async function PUT(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { nodes, edges } = (await request.json()) as {
//       nodes: Node[];
//       edges: Edge[];
//     };
//     const session = await getKindeServerSession();
//     const user = await session.getUser();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Verify workflow exists and user owns it
//     const workflow = await prisma.workflow.findUnique({
//       where: { id, userId: user.id },
//     });

//     if (!workflow) {
//       return NextResponse.json(
//         { error: "Workflow not found" },
//         { status: 404 }
//       );
//     }

//     // Delete existing nodes and edges
//     await prisma.node.deleteMany({ where: { workflowId: id } });
//     await prisma.edge.deleteMany({ where: { workflowId: id } });

//     // Create new nodes
//     await prisma.node.createMany({
//       data: nodes.map((node) => ({
//         nodeId: node.id,
//         type: node.type,
//         position: node.position,
//         deletable: node.deletable ?? true,
//         data: node.data,
//         workflowId: id,
//       })),
//     });

//     // Create new edges
//     await prisma.edge.createMany({
//       data: edges.map((edge) => ({
//         id: edge.id,
//         source: edge.source,
//         target: edge.target,
//         workflowId: id,
//       })),
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Workflow updated successfully",
//     });
//   } catch (error) {
//     console.error("Error occurred:", error);
//     return NextResponse.json(
//       {
//         error: `Failed to update workflow: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`,
//       },
//       { status: 500 }
//     );
//   }
// }
