import { GlobeIcon } from "lucide-react";

export const TOOL_MODE_ENUM = {
  SELECT: "select",
  HAND: "hand",
} as const;

export type ToolModeType = (typeof TOOL_MODE_ENUM)[keyof typeof TOOL_MODE_ENUM];

export const MODELS = [
  {
    value: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
  },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku (Fast)" },
];

export const TOOLS = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Search the web",
    icon: GlobeIcon,
  },
];
