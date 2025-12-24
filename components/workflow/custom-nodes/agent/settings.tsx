/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AgentSettingsProps {
  id: string;
  data: any;
  onUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
}

export const AgentSettings = ({ data, id, onUpdate }: AgentSettingsProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate?.(id, {
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-medium">
          Agent Name
        </Label>
        <Input
          id="name"
          value={(data?.name as string) || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="My Agent"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-xs font-medium">
          System Prompt
        </Label>
        <Textarea
          id="prompt"
          value={(data?.prompt as string) || ""}
          onChange={(e) => handleChange("prompt", e.target.value)}
          placeholder="You are a helpful AI assistant..."
          className="text-sm min-h-32 resize-none"
        />
      </div>

      <div className="flex items-center justify-between space-y-2">
        <Label htmlFor="model" className="text-xs font-medium">
          Model
        </Label>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <Label htmlFor="model" className="text-xs font-medium">
          Tools
        </Label>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <Label htmlFor="model" className="text-xs font-medium">
          Stop count
        </Label>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <Label htmlFor="model" className="text-xs font-medium">
          Model
        </Label>
      </div>
    </div>
  );
};
