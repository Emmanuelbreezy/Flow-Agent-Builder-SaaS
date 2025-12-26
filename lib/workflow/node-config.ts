/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Brain,
  FileIcon,
  GitBranch,
  Globe,
  Layers,
  Square,
  UserCheck,
} from "lucide-react";

export const TOOL_MODE_ENUM = {
  SELECT: "select",
  HAND: "hand",
} as const;

export type ToolModeType = (typeof TOOL_MODE_ENUM)[keyof typeof TOOL_MODE_ENUM];

export type NodeDataType = {
  type: NodeType;
  label: string;
  color: string;
  icon: React.ElementType;
  id: string;
  position: { x: number; y: number };
  data: Record<string, any>;
};

export const NODE_TYPES = {
  START: "start",
  AGENT: "agent",
  USER_APPROVAL: "user-approval",
  IF_ELSE: "if-else",
  END: "end",
  HTTP: "http",
  COMMENT: "comment",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export const NODE_CONFIG = {
  [NODE_TYPES.START]: {
    type: NODE_TYPES.START,
    label: "Start",
    color: "bg-emerald-500",
    defaultData: {
      name: "Start",
    },
    defaultOutputSchema: ["input"],
  },

  [NODE_TYPES.AGENT]: {
    type: NODE_TYPES.AGENT,
    label: "Agent",
    icon: Brain,
    color: "bg-blue-500",
    defaultData: {
      name: "Agent",
      instructions: "",
      includeChatHistory: true,
      model: "gpt-4-mini",
      tools: [],
      outputFormat: "text", // ← text or json
      responseSchema: null, // ← null until user adds schema
    },
    defaultOutputSchema: ["output.text"], // ← Default for text mode
  },

  [NODE_TYPES.IF_ELSE]: {
    type: NODE_TYPES.IF_ELSE,
    label: "If / Else",
    color: "bg-orange-500",
    icon: GitBranch,
    defaultData: {
      conditions: [
        {
          caseName: "",
          condition: "",
        },
      ],
    },
    defaultOutputSchema: ["output.result"],
  },

  [NODE_TYPES.USER_APPROVAL]: {
    type: NODE_TYPES.USER_APPROVAL,
    label: "User Approval",
    color: "bg-amber-400",
    icon: UserCheck,
    defaultData: {
      name: "User Approval",
      message: "",
      options: ["Approve", "Reject"],
    },
    defaultOutputSchema: ["output.response"],
  },

  [NODE_TYPES.HTTP]: {
    type: NODE_TYPES.HTTP,
    label: "HTTP",
    color: "bg-blue-400",
    icon: Globe,
    defaultData: {
      method: "GET",
      url: "",
      headers: {},
      body: {},
    },
    defaultOutputSchema: ["output.status", "output.headers", "output.body"],
  },

  [NODE_TYPES.END]: {
    type: NODE_TYPES.END,
    label: "End",
    color: "bg-red-400",
    icon: Square,
    defaultData: {
      outputValue: "",
    },
    defaultOutputSchema: [],
  },

  [NODE_TYPES.COMMENT]: {
    type: NODE_TYPES.COMMENT,
    label: "Note",
    color: "bg-gray-500",
    icon: FileIcon,
    defaultData: {
      comment: "",
    },
    defaultOutputSchema: [],
  },
} as const;

export const getNodeConfig = (type: NodeType) => NODE_CONFIG?.[type] || {};

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
