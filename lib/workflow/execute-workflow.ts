/* eslint-disable @typescript-eslint/no-explicit-any */
import TopologicalSort from "topological-sort";
import { getNodeExecutor, NodeType } from "./node-config";
import { ExecutorContextType } from "@/types/workflow";
import { NodeTypeEnum } from "@/lib/workflow/node-config";
import { Edge, Node } from "@xyflow/react";
import { UIMessage } from "ai";

/**
 * Performs topological sort on workflow nodes
 *  using topological-sort library
 * Returns nodes in execution order based on their dependencies
 */
export function topologicalSort(nodes: Node[], edges: Edge[]) {
  const ts = new TopologicalSort(new Map());
  const excludedNodes: NodeType[] = [NodeTypeEnum.COMMENT]; // Exclude COMMENT nodes from execution
  // Add all nodes to the sort
  nodes.forEach((node) => {
    ts.addNode(node.id, node);
  });

  // Add edges (dependencies)
  edges.forEach((edge) => {
    ts.addEdge(edge.source, edge.target);
  });

  try {
    // Get sorted nodes
    const sortedMap = ts.sort();
    // Make array of sorted node IDs
    const sortedIds = Array.from(sortedMap.keys());
    // Map sorted IDs to original nodes and filter out excluded nodes
    return sortedIds
      .map((id) => nodes.find((node) => node.id === id)!)
      .filter(
        (node) =>
          node.type !== undefined &&
          !excludedNodes.includes(node.type as NodeType)
      );
  } catch (error: any) {
    throw new Error(
      "Workflow contains a cycle or invalid dependencies. Cannot execute.",
      { cause: error }
    );
  }
}

/**
 * Gets the next node(s) to
 * execute based on edges and conditions
 */
export function getNextNodes(
  currentNodeId: string,
  edges: Edge[],
  context: ExecutorContextType
): string[] {
  // Get all outgoing edges for the current node
  const outgoingEdges = edges.filter((e) => e.source === currentNodeId);

  // If no outgoing edges, return empty array
  if (outgoingEdges.length === 0) {
    return [];
  }

  // For conditional nodes (IF/ELSE), filter by sourceHandle
  const currentOutput = context.outputs[currentNodeId];

  if (currentOutput?.selectedBranch) {
    // Find the edge that corresponds to the selected branch
    const branchEdge = outgoingEdges.find(
      (e) => e.sourceHandle === currentOutput.selectedBranch
    );
    return branchEdge ? [branchEdge.target] : [];
  }

  // For regular nodes, return all connected nodes
  // If no specific branch is selected, return all outgoing edges
  return outgoingEdges.map((e) => e.target);
}

export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  userInput: string,
  messages: UIMessage[],
  channel: any,
  workflowRunId: string
) {
  const startNode = nodes.find((n) => n.type === NodeTypeEnum.START);
  if (!startNode) throw new Error("No START node");
  // Initialize workflow execution
  await channel.emit("workflow.chunk", {
    type: "data-workflow-start",
    data: {
      id: startNode.id,
      nodeType: startNode.type,
      message: `Starting workflow execution...`,
    },
    transient: true, // This chunk is transient and won't be stored in history
  });

  //const tools = await getTools(selectedTools);

  const context: ExecutorContextType = {
    outputs: {
      [startNode.id]: { input: userInput },
    },
    history: messages || [],
    workflowRunId,
    channel,
  };

  // Get Sorted Nodes in Execution Order
  const sortedNodes = topologicalSort(nodes, edges);
  // Track which nodes have been executed
  //const executedNodes = new Set<string>();
  const nodesToExecute = new Set<string>([startNode.id]);

  // Execute nodes in topological order
  for (const node of sortedNodes) {
    // Skip if node shouldn't be executed yet (conditional branching)
    if (!nodesToExecute.has(node.id)) {
      console.log(`Skipping ${node.id} - not in execution path`);
      continue;
    }
    const nodeType = node.type as NodeType;
    const executor = getNodeExecutor(nodeType);
    // Emit loading state
    await channel.emit("workflow.chunk", {
      type: "data-workflow-node",
      id: node.id,
      data: {
        id: node.id,
        nodeType: node.type,
        nodeName: node.data?.name,
        status: "loading",
      },
    });

    try {
      // Execute node
      const result = await executor(node, context);
      // Store output
      if (node.type !== NodeTypeEnum.START) {
        const outputResult =
          node.type === NodeTypeEnum.AGENT ? result : result.output;
        context.outputs[node.id] = outputResult;
      }

      // Emit node result
      await channel.emit("workflow.chunk", {
        type: "data-workflow-node",
        id: node.id,
        data: {
          id: node.id,
          nodeType: node.type,
          nodeName: node.data?.name,
          output: result.output?.text || result.output,
          status: "complete",
        },
      });

      // Handle END node
      if (node.type === NodeTypeEnum.END) {
        console.log(
          "End node reached, finishing workflow."
          //JSON.stringify(context, null, 2)
        );
        await channel.emit("workflow.chunk", {
          type: "finish",
          reason: "stop",
        });

        return {
          success: true,
          outputs: context.outputs,
        };
      }

      // Determine next nodes to execute
      const nextNodeIds = getNextNodes(node.id, edges, context);

      // If no next nodes and not END node, workflow stops (disconnected)
      if (nextNodeIds.length === 0) {
        await channel.emit("workflow.chunk", {
          type: "finish",
          reason: "stop",
        });

        return {
          success: false,
          output: "Workflow stopped: disconnected nodes",
        };
      }

      // Add next nodes to execution queue
      nextNodeIds.forEach((id) => nodesToExecute.add(id));
      //
      //
      //
    } catch (error: any) {
      console.error(`Error executing node ${node.id}:`, error);
      await channel.emit("workflow.chunk", {
        type: "data-workflow-node",
        id: node.id,
        data: {
          id: node.id,
          nodeType: node.type,
          nodeName: node.data?.name,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  // If no END node was reached
  await channel.emit("workflow.chunk", {
    type: "finish",
    reason: "stop",
  });

  return {
    success: true,
    output: "",
    outputs: context.outputs,
  };
}

//
//
//
//
//
//
///
//
//
// export async function executeWorkflow2(
//   nodes: Node[],
//   edges: Edge[],
//   userInput: string,
//   channel: any,
//   sessionId: string
// ) {
//   const startNode = nodes.find((n) => n.type === NodeTypeEnum.START);
//   if (!startNode) throw new Error("No START node");

//   // Initialize workflow execution
//   await channel.emit("workflow.chunk", {
//     chunk: {
//       type: "data-workflow-start",
//       data: {
//         id: startNode.id,
//         nodeType: startNode.type,
//         message: `Starting workflow execution...`,
//       },
//       transient: true, // This chunk is transient and won't be stored in history
//     },
//   });

//   const context: ExecutorContextType = {
//     outputs: {
//       [startNode.id]: { input: userInput },
//     },
//     history: [],
//     sessionId,
//     channel,
//   };

//   try {
//     // Get Sorted Nodes in Execution Order
//     const sortedNodes = topologicalSort(nodes, edges);

//     console.log(
//       "Execution order:",
//       sortedNodes.map((n) => `${n.id} (${n.type})`).join(" → ")
//     );

//     // Track which nodes have been executed
//     const executedNodes = new Set<string>();
//     const nodesToExecute = new Set<string>([startNode.id]);

//     // Execute nodes in topological order
//     for (const node of sortedNodes) {
//       // Skip if node shouldn't be executed yet (conditional branching or disconnected)
//       if (!nodesToExecute.has(node.id)) {
//         console.log(`Skipping ${node.id} - not in execution path`);
//         continue;
//       }

//       try {
//         const nodeType = node.type as NodeType;
//         const executor = getNodeExecutor(nodeType);

//         // Emit loading state
//         await channel.emit("workflow.chunk", {
//           chunk: {
//             type: "data-workflow-node",
//             data: {
//               id: node.id,
//               nodeType: node.type,
//               nodeName: node.data?.name,
//               status: "loading",
//             },
//           },
//         });

//         // Execute node
//         const result = await executor(node, context);

//         // Store output in context (for variable replacement)
//         context.outputs[node.id] = result.output;
//         executedNodes.add(node.id);

//         console.log(
//           `Node ${node.id} (${node.type}) executed. Output:`,
//           result.output
//         );

//         // Extract displayable output for UI
//         const displayOutput = result.output?.text || result.output;

//         // Emit node result
//         await channel.emit("workflow.chunk", {
//           chunk: {
//             type: "data-workflow-node",
//             data: {
//               id: node.id,
//               nodeType: node.type,
//               nodeName: node.data?.name,
//               output: displayOutput,
//               status: "complete",
//             },
//           },
//         });

//         // Handle END node
//         if (node.type === NodeTypeEnum.END) {
//           console.log("End node reached, finishing workflow.");
//           await channel.emit("workflow.chunk", {
//             chunk: {
//               type: "data-workflow-complete",
//               data: {
//                 message: "Workflow completed successfully.",
//               },
//               transient: true,
//             },
//           });

//           await channel.emit("workflow.chunk", {
//             chunk: { type: "finish", reason: "stop" },
//           });

//           return {
//             success: true,
//             output: result.output.finalOutput || result.output,
//             outputs: context.outputs,
//             executedNodes: Array.from(executedNodes),
//           };
//         }

//         // Determine next nodes to execute
//         const nextNodeIds = getNextNodes(node.id, edges, context);

//         // If no next nodes and not END node, workflow stops (disconnected)
//         if (nextNodeIds.length === 0 && node.type !== NodeTypeEnum.END) {
//           console.log(
//             `Node ${node.id} has no outgoing edges. Workflow ending prematurely.`
//           );

//           await channel.emit("workflow.chunk", {
//             chunk: {
//               type: "data-workflow-warning",
//               data: {
//                 message: `Node "${node.data?.name}" has no connections. Workflow stopped.`,
//               },
//               transient: true,
//             },
//           });

//           await channel.emit("workflow.chunk", {
//             chunk: { type: "finish", reason: "stop" },
//           });

//           return {
//             success: false,
//             output: "Workflow stopped: disconnected nodes",
//             outputs: context.outputs,
//             executedNodes: Array.from(executedNodes),
//           };
//         }

//         // Add next nodes to execution queue
//         nextNodeIds.forEach((id) => nodesToExecute.add(id));
//       } catch (error) {
//         console.error(`Error executing node ${node.id}:`, error);
//         await channel.emit("workflow.error", {
//           type: "data-workflow-node-error",
//           data: {
//             id: node.id,
//             nodeType: node.type,
//             error: error instanceof Error ? error.message : String(error),
//           },
//         });

//         throw error;
//       }
//     }

//     // If no END node was reached
//     await channel.emit("workflow.chunk", {
//       chunk: { type: "finish", reason: "stop" },
//     });

//     return {
//       success: false,
//       output: "Workflow completed without END node",
//       outputs: context.outputs,
//       executedNodes: Array.from(executedNodes),
//     };
//   } catch (error) {
//     console.error("Workflow execution failed:", error);

//     await channel.emit("workflow.chunk", {
//       chunk: { type: "finish", reason: "error" },
//     });

//     throw error;
//   }
// }
