/* eslint-disable @typescript-eslint/no-explicit-any */
import { GitBranch, Layers, Pointer, Square, UserCheck } from "lucide-react";

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

// // Optional: Create a mapping of node metadata
export const NODE_CONFIG = {
  [NODE_TYPES.START]: {
    type: NODE_TYPES.START,
    label: "Start",
    color: "bg-gray-400",
    icon: UserCheck,
    handles: { target: false, source: true },
  },
  [NODE_TYPES.AGENT]: {
    type: NODE_TYPES.AGENT,
    label: "Agent",
    icon: Pointer,
    color: "bg-blue-500",
    handles: { target: true, source: true },
  },
  [NODE_TYPES.USER_APPROVAL]: {
    type: NODE_TYPES.USER_APPROVAL,
    label: "User approval",
    color: "bg-orange-500",
    icon: UserCheck,
  },
  [NODE_TYPES.IF_ELSE]: {
    type: NODE_TYPES.IF_ELSE,
    label: "If / else",
    color: "bg-orange-500",
    icon: GitBranch,
  },
  [NODE_TYPES.END]: {
    type: NODE_TYPES.END,
    label: "End",
    color: "bg-emerald-400",
    icon: Square,
  },
  [NODE_TYPES.MCP]: {
    type: NODE_TYPES.MCP,
    label: "MCP",
    color: "bg-yellow-400",
    icon: Layers,
  },
  [NODE_TYPES.SET_STATE]: {
    type: NODE_TYPES.SET_STATE,
    label: "Content",
    color: "bg-purple-400",
    icon: UserCheck,
  },
} as const;

export const getNodeConfig = (type: NodeType) => NODE_CONFIG[type];
