/* eslint-disable @typescript-eslint/no-explicit-any */
import TopologicalSort from "topological-sort";
import { getNodeExecutor, NodeType } from "./node-config";
import { ExecutorContextType } from "@/types/workflow";
import { NodeTypeEnum } from "@/lib/workflow/node-config";
import { Edge, Node } from "@xyflow/react";

/**
 * Performs topological sort on workflow nodes
 *  using topological-sort library
 * Returns nodes in execution order based on their dependencies
 */
function topologicalSort(nodes: Node[], edges: Edge[]) {
  const ts = new TopologicalSort(new Map());

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
    // Map sorted IDs to original nodes
    return sortedIds.map((id) => nodes.find((node) => node.id === id)!);
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
function getNextNodes(
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
  channel: any,
  sessionId: string
) {
  const startNode = nodes.find((n) => n.type === NodeTypeEnum.START);
  if (!startNode) throw new Error("No START node");
  // Initialize workflow execution
  await channel.emit("workflow.chunk", {
    chunk: {
      type: "data-workflow-start",
      data: {
        id: startNode.id,
        nodeType: startNode.type,
        text: `Starting workflow execution...`,
      },
    },
  });

  const context: ExecutorContextType = {
    outputs: {
      [startNode.id]: { input: userInput },
    },
    history: [],
    sessionId,
    channel,
  };

  try {
    // Get Sorted Nodes in Execution Order
    const sortedNodes = topologicalSort(nodes, edges);

    console.log(
      "Execution order:",
      sortedNodes.map((n) => `${n.id} (${n.type})`).join(" → ")
    );

    // Track which nodes have been executed
    const executedNodes = new Set<string>();
    const nodesToExecute = new Set<string>([startNode.id]);

    // Execute nodes in topological order
    for (const node of sortedNodes) {
      // Skip if node shouldn't be executed yet (conditional branching)
      if (!nodesToExecute.has(node.id)) {
        console.log(`Skipping ${node.id} - not in execution path`);
        continue;
      }

      try {
        const nodeType = node.type as NodeType;
        const executor = getNodeExecutor(nodeType);

        await channel.emit("workflow.chunk", {
          chunk: {
            type: "data-workflow-node-start",
            data: {
              id: node.id,
              nodeType: node.type,
              nodeName: node.data?.name || node.type,
            },
          },
        });

        // Execute node
        const result = await executor(node, context);

        // Store output
        context.outputs[node.id] = result.output;
        executedNodes.add(node.id);

        console.log(
          `Node ${node.id} (${node.type}) executed. Output:`,
          result.output
        );

        // Emit node result
        if (node.type !== NodeTypeEnum.END) {
          await channel.emit("workflow.chunk", {
            chunk: {
              type: "data-workflow-node-complete",
              data: {
                id: node.id,
                nodeType: node.type,
                output: result.output,
              },
            },
          });
        }

        // Handle END node
        if (node.type === NodeTypeEnum.END) {
          console.log("End node reached, finishing workflow.");
          await channel.emit("workflow.chunk", {
            chunk: {
              type: "data-workflow-complete",
              data: {
                output: result.output.finalOutput || result.output,
                executedNodes: Array.from(executedNodes),
              },
            },
          });

          await channel.emit("workflow.chunk", {
            chunk: { type: "finish", reason: "stop" },
          });

          return {
            success: true,
            output: result.output.finalOutput || result.output,
            outputs: context.outputs,
            executedNodes: Array.from(executedNodes),
          };
        }

        // Determine next nodes to execute
        const nextNodeIds = getNextNodes(node.id, edges, context);
        nextNodeIds.forEach((id) => nodesToExecute.add(id));
      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        await channel.emit("workflow.error", {
          type: "data-workflow-node-error",
          data: {
            id: node.id,
            nodeType: node.type,
            error: error instanceof Error ? error.message : String(error),
          },
        });

        throw error;
      }
    }

    // If no END node was reached
    await channel.emit("workflow.chunk", {
      chunk: { type: "finish", reason: "stop" },
    });

    return {
      success: true,
      output: "Workflow completed without END node",
      outputs: context.outputs,
    };
  } catch (error) {
    console.error("Workflow execution failed:", error);

    await channel.emit("workflow.chunk", {
      chunk: { type: "finish", reason: "error" },
    });

    throw error;
  }
}
