/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutorContextType } from "@/types/workflow";
import { Node } from "@xyflow/react";
import { realtime } from "@/lib/realtime";

export async function executeUserApproval(
  node: Node,
  context: ExecutorContextType
): Promise<{ output: any }> {
  const { channel, workflowContext, workflowRunId } = context;
  const message = (node.data?.message as string) || "Do you want to proceed?";
  const eventId = `approval-${node.id}-${Date.now()}`;
  const realtimeChannel = realtime.channel(workflowRunId);

  try {
    // Emit loading state
    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      id: node.id,
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data?.name,
        status: "loading",
        state: "approval-requested",
        output: { message },
      },
    });

    // Wait for user approval via workflow notify
    // Notify Realtime + Wait for approval
    const [{ eventData, timeout }] = await Promise.all([
      workflowContext!.waitForEvent("approval-response", eventId, {
        timeout: "5m",
      }) as Promise<{ eventData: { approved: boolean }; timeout: boolean }>,

      workflowContext!.run("notify-waiting", () =>
        realtimeChannel.emit("workflow.waitingForInput", {
          eventId,
          nodeId: node.id,
          message,
        })
      ),
    ]);

    if (timeout) {
      throw new Error("Approval request timed out");
    }

    // Emit resolved
    await workflowContext!.run("input-resolved", () =>
      realtimeChannel.emit("workflow.inputResolved", {
        eventId,
        approved: eventData.approved,
      })
    );

    // Emit completion to chat
    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      id: node.id,
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data?.name,
        status: "complete",
        state: "approval-responded",
        output: {
          message,
          response: eventData.approved ? "Approved" : "Rejected",
        },
        approval: {
          id: node.id,
          approved: eventData.approved,
        },
      },
    });

    return {
      output: {
        response: eventData.approved ? "Approved" : "Rejected",
        approved: eventData.approved,
        selectedBranch: eventData.approved ? "approve" : "reject",
      },
    };
  } catch (error) {
    console.error("User approval error:", error);
    throw error;
  }
}

// import { ExecutorContextType } from "@/types/workflow";
// import { Node } from "@xyflow/react";

// export async function executeUserApproval(
//   node: Node,
//   context: ExecutorContextType
// ): Promise<{ output: any }> {
//   const { channel } = context;
//   const message = node.data?.message || "Do you want to proceed?";
//   const eventId = `approval-${node.id}-${Date.now()}`;

//   try {
//     // Emit waiting for input event
//     await channel.emit("workflow.chunk", {
//       chunk: {
//         type: "data-workflow-node",
//         data: {
//           id: node.id,
//           nodeType: node.type,
//           nodeName: node.data?.name,
//           status: "loading",
//           state: "approval-requested",
//           output: {
//             message,
//           },
//         },
//       },
//     });

//     // Wait for user approval
//     const [{ eventData, timeout }] = await Promise.all([
//       context.channel.waitForEvent("approval-response", eventId, {
//         timeout: "5m",
//       }) as Promise<{ eventData: { approved: boolean }; timeout: boolean }>,
//       //
//       context.channel.emit("workflow.chunk", {
//         chunk: {
//           type: "workflow.waitingForInput",
//           data: {
//             eventId,
//             nodeId: node.id,
//             message,
//           },
//         },
//       }),
//     ]);

//     // Handle timeout
//     if (timeout) {
//       throw new Error("Approval request timed out");
//     }

//     // Emit approval resolved
//     await context.channel.emit("workflow.chunk", {
//       chunk: {
//         type: "workflow.inputResolved",
//         data: {
//           eventId,
//           approved: eventData.approved,
//         },
//       },
//     });

//     // Emit completion
//     await context.channel.emit("workflow.chunk", {
//       chunk: {
//         type: "data-workflow-node",
//         data: {
//           id: node.id,
//           nodeType: node.type,
//           nodeName: node.data?.name,
//           status: "complete",
//           state: "approval-responded",
//           output: {
//             message,
//             response: eventData.approved ? "Approved" : "Rejected",
//           },
//           approval: {
//             id: node.id,
//             approved: eventData.approved,
//           },
//         },
//       },
//     });

//     return {
//       output: {
//         approved: eventData.approved,
//         selectedBranch: eventData.approved ? "approve" : "reject",
//       },
//     };
//   } catch (error) {
//     console.error("User approval error:", error);
//     throw error;
//   }
// }
