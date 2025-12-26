import { GlobeIcon } from "lucide-react";

export const MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
];

export const TOOLS = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Search the web",
    icon: GlobeIcon,
  },
];
