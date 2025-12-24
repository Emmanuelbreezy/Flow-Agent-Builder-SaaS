/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Brain,
  FileIcon,
  FileTextIcon,
  GitBranch,
  Layers,
  NotebookIcon,
  Square,
  UserCheck,
} from "lucide-react";

export const TOOL_MODE_ENUM = {
  SELECT: "select",
  HAND: "hand",
} as const;

export type ToolModeType = (typeof TOOL_MODE_ENUM)[keyof typeof TOOL_MODE_ENUM];

export const NODE_TYPES = {
  START: "start",
  AGENT: "agent",
  USER_APPROVAL: "user-approval",
  IF_ELSE: "if-else",
  END: "end",
  MCP: "mcp",
  SET_STATE: "set-state",
  COMMENT: "comment",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export type NodeDataType = {
  type: NodeType;
  label: string;
  color: string;
  icon: React.ElementType;
  id: string;
  position: { x: number; y: number };
  data: Record<string, any>;
};

// Node configuration with default data/settings
export const NODE_CONFIG = {
  [NODE_TYPES.START]: {
    type: NODE_TYPES.START,
    label: "Start", // Display name on canvas
    color: "bg-emerald-500",
    icon: UserCheck,
    defaultData: {
      inputVariable: "input_as_text", // Fixed workflow input variable
    },
  },
  [NODE_TYPES.AGENT]: {
    type: NODE_TYPES.AGENT,
    label: "Agent",
    icon: Brain,
    color: "bg-blue-500",
    defaultData: {
      name: "Agent", // User can edit this
      instructions: "", // User can edit
      includeChatHistory: true,
      model: "gpt-4.1-mini",
      tools: [],
      outputFormat: "text",
      responseSchema: null,
    },
  },
  [NODE_TYPES.COMMENT]: {
    type: NODE_TYPES.COMMENT,
    label: "Note",
    color: "bg-gray-500",
    icon: FileIcon,
    defaultData: {
      comment: "",
    },
  },
  [NODE_TYPES.USER_APPROVAL]: {
    type: NODE_TYPES.USER_APPROVAL,
    label: "User approval",
    color: "bg-amber-400",
    icon: UserCheck,
    defaultData: {
      name: "User approval",
      message: "",
      options: ["Approve", "Reject"], // Fixed options, not editable in settings
    },
  },
  [NODE_TYPES.IF_ELSE]: {
    type: NODE_TYPES.IF_ELSE,
    label: "If / else",
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
  },
  [NODE_TYPES.END]: {
    type: NODE_TYPES.END,
    label: "End",
    color: "bg-red-400",
    icon: Square,
    defaultData: {
      outputValue: "",
    },
  },
  [NODE_TYPES.MCP]: {
    type: NODE_TYPES.MCP,
    label: "MCP",
    color: "bg-yellow-400",
    icon: Layers,
    defaultData: {
      toolName: "",
      parameters: {},
    },
  },
  [NODE_TYPES.SET_STATE]: {
    type: NODE_TYPES.SET_STATE,
    label: "Content",
    color: "bg-purple-400",
    icon: UserCheck,
    defaultData: {
      variable: "",
      value: "",
    },
  },
} as const;

export const getNodeConfig = (type: NodeType) => NODE_CONFIG?.[type] || {};
