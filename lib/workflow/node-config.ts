/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Brain,
  FileIcon,
  GitBranch,
  Globe,
  Play,
  Square,
  UserCheck,
} from "lucide-react";
import { generateId } from "@/lib/helper";
import { executeStart } from "@/components/workflow/custom-nodes/start/executor";
import { executeAgent } from "@/components/workflow/custom-nodes/agent/executor";
import { executeHttp } from "@/components/workflow/custom-nodes/http/executor";
import { executeIfElse } from "@/components/workflow/custom-nodes/if-else/executor";
import { executeUserApproval } from "@/components/workflow/custom-nodes/user-approval/executor";
import { executeEnd } from "@/components/workflow/custom-nodes/end/executor";
import { MODELS } from "./constants";

export const NodeTypeEnum = {
  START: "start",
  AGENT: "agent",
  USER_APPROVAL: "user_approval",
  IF_ELSE: "if_else",
  END: "end",
  HTTP: "http",
  COMMENT: "comment",
} as const;

export type NodeType = (typeof NodeTypeEnum)[keyof typeof NodeTypeEnum];

export const NODE_EXECUTORS = {
  [NodeTypeEnum.START]: executeStart,
  [NodeTypeEnum.AGENT]: executeAgent,
  [NodeTypeEnum.IF_ELSE]: executeIfElse,
  [NodeTypeEnum.HTTP]: executeHttp,
  [NodeTypeEnum.USER_APPROVAL]: executeUserApproval,
  [NodeTypeEnum.END]: executeEnd,
};

// Next
type NodeConfigBase = {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  color: string;
  inputs: Record<string, any>;
  outputs: string[];
};

export const NODE_CONFIG: Record<NodeType, NodeConfigBase> = {
  [NodeTypeEnum.START]: {
    type: NodeTypeEnum.START,
    label: "Start",
    icon: Play,
    color: "bg-emerald-500",
    inputs: {
      inputValue: "",
    },
    outputs: ["input"],
  },

  [NodeTypeEnum.AGENT]: {
    type: NodeTypeEnum.AGENT,
    label: "Agent",
    icon: Brain,
    color: "bg-blue-500",
    inputs: {
      name: "Agent",
      instructions: "",
      includeChatHistory: true,
      model: MODELS[0].value,
      tools: [],
      outputFormat: "text", // ← text or json
      responseSchema: null, // ← null until user adds schema
    },
    outputs: ["output.text"], // ← Default for text mode
  },

  [NodeTypeEnum.IF_ELSE]: {
    type: NodeTypeEnum.IF_ELSE,
    label: "If / Else",
    color: "bg-orange-500",
    icon: GitBranch,
    inputs: {
      conditions: [
        {
          caseName: "",
          condition: "",
        },
      ],
    },
    outputs: ["output.result"],
  },

  [NodeTypeEnum.USER_APPROVAL]: {
    type: NodeTypeEnum.USER_APPROVAL,
    label: "User Approval",
    color: "bg-amber-400",
    icon: UserCheck,
    inputs: {
      name: "User Approval",
      message: "",
      options: ["Approve", "Reject"],
    },
    outputs: ["output.response"],
  },

  [NodeTypeEnum.HTTP]: {
    type: NodeTypeEnum.HTTP,
    label: "HTTP",
    color: "bg-blue-400",
    icon: Globe,
    inputs: {
      method: "GET",
      url: "",
      headers: {},
      body: {},
    },
    outputs: ["output.status", "output.headers", "output.body"],
  },

  [NodeTypeEnum.END]: {
    type: NodeTypeEnum.END,
    label: "End",
    color: "bg-red-400",
    icon: Square,
    inputs: {
      value: "",
    },
    outputs: ["output.text"],
  },

  [NodeTypeEnum.COMMENT]: {
    type: NodeTypeEnum.COMMENT,
    label: "Comment",
    color: "bg-gray-500",
    icon: FileIcon,
    inputs: {
      comment: "",
    },
    outputs: [],
  },
} as const;

export const getNodeConfig = (type: NodeType) => {
  const nodetype = NODE_CONFIG?.[type];
  if (!nodetype) {
    throw new Error(`No node config found for node type: ${type}`);
  }
  return nodetype;
};

export type CreateNodeOptions = {
  type: NodeType;
  position?: { x: number; y: number };
};

export function createNode({
  type,
  position = { x: 400, y: 200 },
}: CreateNodeOptions) {
  const config = getNodeConfig(type);
  const id = generateId(type);
  return {
    id,
    type,
    position,
    deletable: type === NodeTypeEnum.START ? false : true,
    data: {
      name: config.label,
      ...config.inputs,
      outputs: config.outputs,
      color: config.color,
    },
  };
}

export function getNodeExecutor(nodeType: NodeType) {
  const executor = NODE_EXECUTORS[nodeType as keyof typeof NODE_EXECUTORS];
  if (!executor) {
    throw new Error(`No executor found for node type: ${nodeType}`);
  }
  return executor;
}

// Node configuration with default data and outputs
// export const NODE_CONFIG = {
//   [NODE_TYPES.START]: {
//     type: NODE_TYPES.START,
//     label: "Start",
//     color: "bg-emerald-500",
//     //icon: Play,
//     defaultData: {
//       inputVariable: "input_as_text",
//     },
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "input_as_text",
//         label: "User Input",
//         type: "string",
//         group: "Workflow",
//       },
//     ],
//   },
//   [NODE_TYPES.AGENT]: {
//     type: NODE_TYPES.AGENT,
//     label: "Agent",
//     icon: Brain,
//     color: "bg-blue-500",
//     defaultData: {
//       name: "Agent",
//       instructions: "",
//       includeChatHistory: true,
//       model: "gpt-4-mini",
//       tools: [],
//       outputFormat: "text",
//       responseSchema: null,
//     },
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "text",
//         label: "Text Response",
//         type: "string",
//         group: "Agent",
//       },
//       {
//         id: "json",
//         label: "Structured JSON",
//         type: "object",
//         group: "Agent",
//       },
//     ],
//   },
//   [NODE_TYPES.COMMENT]: {
//     type: NODE_TYPES.COMMENT,
//     label: "Note",
//     color: "bg-gray-500",
//     icon: FileIcon,
//     defaultData: {
//       comment: "",
//     },
//     outputs: (): WorkflowVariable[] => [],
//   },
//   [NODE_TYPES.USER_APPROVAL]: {
//     type: NODE_TYPES.USER_APPROVAL,
//     label: "User approval",
//     color: "bg-amber-400",
//     icon: UserCheck,
//     defaultData: {
//       name: "User approval",
//       message: "",
//       options: ["Approve", "Reject"],
//     },
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "response",
//         label: "User Response",
//         type: "string",
//         group: "User Approval",
//       },
//     ],
//   },
//   [NODE_TYPES.IF_ELSE]: {
//     type: NODE_TYPES.IF_ELSE,
//     label: "If / else",
//     color: "bg-orange-500",
//     icon: GitBranch,
//     defaultData: {
//       conditions: [
//         {
//           caseName: "",
//           condition: "",
//         },
//       ],
//     },
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "result",
//         label: "Condition Result",
//         type: "boolean",
//         group: "If/Else",
//       },
//     ],
//   },
//   [NODE_TYPES.END]: {
//     type: NODE_TYPES.END,
//     label: "End",
//     color: "bg-red-400",
//     icon: Square,
//     // INPUTS
//     defaultData: {
//       outputValue: "",
//     },
//     // OUTPUTS
//     outputs: (): WorkflowVariable[] => [],
//   },
//   [NODE_TYPES.MCP]: {
//     type: NODE_TYPES.MCP,
//     label: "MCP",
//     color: "bg-yellow-400",
//     icon: Layers,
//     // INPUTS
//     defaultData: {
//       toolName: "",
//       parameters: {},
//     },
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "result",
//         label: "Tool Result",
//         type: "object",
//         group: "MCP Output",
//       },
//     ],
//   },
//   [NODE_TYPES.HTTP]: {
//     type: NODE_TYPES.HTTP,
//     label: "HTTP",
//     color: "bg-blue-400",
//     icon: Globe,
//     // INPUTS
//     defaultData: {
//       variable: "", // Variable name
//       method: "GET", // HTTP method
//       url: "", // Can have {{variables}}
//       headers: {}, // Custom headers
//       body: {}, // Request body
//     },
//     // OUTPUTS
//     outputs: (): WorkflowVariable[] => [
//       {
//         id: "body",
//         label: "Response Body",
//         type: "object",
//         group: "HTTP Data",
//       },
//       {
//         id: "statusCode",
//         label: "Status Code",
//         type: "number",
//         group: "HTTP Data",
//       },
//     ],
//   },
// } as const;
