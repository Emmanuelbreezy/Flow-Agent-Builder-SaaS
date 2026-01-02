import { ExecutorContextType } from "@/types/workflow";
import { Node } from "@xyflow/react";

export async function executeUserApproval(
  node: Node,
  context: ExecutorContextType
): Promise<{
  output: {
    response: string;
    approved: boolean;
    selectedBranch: string;
  };
}> {
  const { channel, workflowRunId } = context;
  const message = (node.data?.message as string) || "Do you want to proceed?";
  const eventId = `approval-${workflowRunId}`;
  console.log("initial-loading:", eventId);

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
      eventId,
    },
  });

  // const [{ eventData, timeout }] = await Promise.all([
  //   // Wait for approval event
  //   ctx.waitForEvent<{ approved: boolean }>("wait-for-approval", eventId, {
  //     timeout: "10m",
  //   }),
  //   // Notify frontend that we're waiting
  //   ctx.run("notify-waiting", async () => {
  //     await channel.emit("workflow.chunk", {
  //       type: "data-workflow-node",
  //       id: node.id,
  //       data: {
  //         id: node.id,
  //         nodeType: node.type,
  //         nodeName: node.data?.name,
  //         status: "loading",
  //         state: "approval-requested",
  //         output: { message },
  //         eventId,
  //       },
  //     });
  //   }),
  // ]);

  // Handle timeout
  // if (timeout) {
  //   await channel.emit("workflow.chunk", {
  //     type: "data-workflow-node",
  //     id: node.id,
  //     data: {
  //       id: node.id,
  //       nodeType: node.type,
  //       nodeName: node.data?.name,
  //       status: "complete",
  //       state: "approval-timeout",
  //       output: {
  //         message,
  //         response: "Rejected (timeout)",
  //       },
  //     },
  //   });
  //   return {
  //     output: {
  //       response: "Rejected",
  //       approved: false,
  //       selectedBranch: "option-1",
  //     },
  //   };
  // }

  // const eventData = await ctx.waitForEvent<{ approved: boolean }>("wait-for-approval", eventId);

  const eventData = { approved: true };

  console.log("input-resolved - Approval:", eventId);
  // Notify that input was resolved
  channel.emit("workflow.chunk", {
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
        approved: eventData.approved,
      },
    },
  });

  // // Emit completion
  console.log("inside-final-complete:-----", eventData);

  return {
    output: {
      response: eventData.approved ? "Approved" : "Rejected",
      approved: eventData.approved,
      selectedBranch: eventData.approved ? "option-0" : "option-1",
    },
  };
}

// // import { ExecutorContextType } from "@/types/workflow";
// // import { Node } from "@xyflow/react";

// // export async function executeUserApproval(
// //   node: Node,
// //   context: ExecutorContextType
// // ): Promise<{
// //   output: {
// //     response: string;
// //     approved: boolean;
// //     selectedBranch: string;
// //   };
// // }> {
// //   const { channel, workflowContext } = context;
// //   const message = (node.data?.message as string) || "Do you want to proceed?";
// //   const eventId = `approval-${node.id}-${Date.now()}`;

// //   // Emit loading state
// //   await channel.emit("workflow.chunk", {
// //     type: "data-workflow-node",
// //     id: node.id,
// //     data: {
// //       id: node.id,
// //       nodeType: node.type,
// //       nodeName: node.data?.name,
// //       status: "loading",
// //       state: "approval-requested",
// //       output: { message },
// //     },
// //   });

// //   // Notify via workflowContext.run
// //   await workflowContext!.run("notify-waiting", async () => {
// //     await channel.emit("workflow.waitingForInput", {
// //       eventId,
// //       nodeId: node.id,
// //       message,
// //     });
// //   });

// //   // Wait for user approval
// //   const { eventData, timeout } = await workflowContext!.waitForEvent<{
// //     approved: boolean;
// //   }>("wait-for-approval", eventId, { timeout: "10m" });

// //   // Handle timeout
// //   if (timeout) {
// //     await channel.emit("workflow.chunk", {
// //       type: "data-workflow-node",
// //       id: node.id,
// //       data: {
// //         id: node.id,
// //         nodeType: node.type,
// //         nodeName: node.data?.name,
// //         status: "complete",
// //         state: "approval-timeout",
// //         output: {
// //           message,
// //           response: "Rejected (timeout)",
// //         },
// //       },
// //     });

// //     return {
// //       output: {
// //         response: "Rejected (timeout)",
// //         approved: false,
// //         selectedBranch: "option-1",
// //       },
// //     };
// //   }

// //   // Emit resolved
// //   await workflowContext!.run("input-resolved", async () => {
// //     await channel.emit("workflow.inputResolved", {
// //       eventId,
// //       approved: eventData.approved,
// //     });
// //   });

// //   // Emit completion
// //   await channel.emit("workflow.chunk", {
// //     type: "data-workflow-node",
// //     id: node.id,
// //     data: {
// //       id: node.id,
// //       nodeType: node.type,
// //       nodeName: node.data?.name,
// //       status: "complete",
// //       state: "approval-responded",
// //       output: {
// //         message,
// //         response: eventData.approved ? "Approved" : "Rejected",
// //       },
// //     },
// //   });

// //   return {
// //     output: {
// //       response: eventData.approved ? "Approved" : "Rejected",
// //       approved: eventData.approved,
// //       selectedBranch: eventData.approved ? "option-0" : "option-1",
// //     },
// //   };
// // }
