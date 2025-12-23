"use client";
import { Node } from "@xyflow/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain } from "lucide-react";

interface AgentSettingsProps {
  node: Node;
  onUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
}

export const AgentSettings = ({ node, onUpdate }: AgentSettingsProps) => {
  const bgcolor = (node.data?.color as string) || "bg-blue-500";

  const handleChange = (field: string, value: string) => {
    onUpdate?.(node.id, {
      ...node.data,
      [field]: value,
    });
  };

  return (
    <Card className="border-none! shadow-none!">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${bgcolor}`}>
            <Brain className="size-4" />
          </span>
          <div>
            <CardTitle className="text-sm">Agent Node</CardTitle>
            <CardDescription className="text-xs">
              AI agent configuration
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-medium">
            Agent Name
          </Label>
          <Input
            id="name"
            value={(node.data?.name as string) || ""}
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
            value={(node.data?.prompt as string) || ""}
            onChange={(e) => handleChange("prompt", e.target.value)}
            placeholder="You are a helpful AI assistant..."
            className="text-sm min-h-32 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-xs font-medium">
            Model
          </Label>
          <Input
            id="model"
            value={(node.data?.model as string) || "gpt-4"}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="gpt-4"
            className="h-8 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
