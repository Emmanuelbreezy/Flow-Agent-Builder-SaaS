/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MentionInputComponent } from "../../mention-input";
import { useReactFlow } from "@xyflow/react";
import {
  FileText,
  GlobeIcon,
  Plus,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { JsonSchema } from "./json-schema";

const OUTPUT_FORMATS = [
  { value: "text", label: "Text" },
  { value: "json", label: "JSON" },
];

const MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
];

const TOOLS = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Search the web",
    icon: GlobeIcon,
  },
  {
    id: "scraper",
    name: "Scraper",
    description: "Scrape web content",
    icon: FileText,
  },
];

interface AgentSettingsProps {
  id: string;
  data: any;
}

export const AgentSettings = ({ data, id }: AgentSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const [openModel, setOpenModel] = useState(false);
  const [openFormat, setOpenFormat] = useState(false);

  const name = (data?.name as string) || "Agent";
  const instructions = (data?.instructions as string) || "";
  const model = (data?.model as string) || "";
  const tools = (data?.tools as string[]) || [];
  const outputFormat = (data?.outputFormat as string) || "text";
  const responseSchema = (data?.responseSchema as any) || {
    type: "object",
    title: "response_schema",
    properties: {},
  };

  const handleChange = (key: string, value: string) => {
    updateNodeData(id, {
      [key]: value,
    });
  };

  const handleAddTool = (toolId: string) => {
    if (!tools.includes(toolId)) {
      updateNodeData(id, {
        tools: [...tools, toolId],
      });
    }
  };

  const handleRemoveTool = (toolId: string) => {
    updateNodeData(id, {
      tools: tools.filter((t) => t !== toolId),
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="My Agent"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">System Instructions</Label>
          <MentionInputComponent
            nodeId={id}
            value={instructions}
            placeholder="You are a helpful AI assistant..."
            rows={2}
            multiline={true}
            onChange={(value) => handleChange("instructions", value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Tools</Label>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                >
                  <Plus className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => handleAddTool(tool.id)}
                      disabled={tools.includes(tool.id)}
                      className="text-sm!"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tool.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Display selected tools */}
          {tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tools.map((toolId) => {
                const tool = TOOLS.find((t) => t.id === toolId);
                const Icon = tool?.icon;
                return (
                  <Badge
                    key={toolId}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {tool?.name}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveTool(toolId);
                      }}
                      className="hover:text-destructive ml-1"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between ">
          <Label className="font-medium">Model</Label>
          <Popover open={openModel} onOpenChange={setOpenModel}>
            <PopoverTrigger>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-8 text-xs"
              >
                {model
                  ? MODELS.find((m) => m.value === model)?.label
                  : "Select model..."}
                <ChevronsUpDown className="size-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search model..." className="h-8" />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {MODELS.map((m) => (
                      <CommandItem
                        key={m.value}
                        value={m.value}
                        onSelect={(currentValue) => {
                          handleChange(
                            "model",
                            currentValue === model ? "" : currentValue
                          );
                          setOpenModel(false);
                        }}
                      >
                        {m.label}
                        <Check
                          className={cn(
                            "ml-auto size-4",
                            model === m.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between ">
          <Label className="text-xs font-medium">Output Format</Label>
          <Popover open={openFormat} onOpenChange={setOpenFormat}>
            <PopoverTrigger>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-8 text-xs"
              >
                {outputFormat
                  ? OUTPUT_FORMATS.find((f) => f.value === outputFormat)?.label
                  : "Select format..."}
                <ChevronsUpDown className="size-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search format..." className="h-8" />
                <CommandList>
                  <CommandEmpty>No format found.</CommandEmpty>
                  <CommandGroup>
                    {OUTPUT_FORMATS.map((f) => (
                      <CommandItem
                        key={f.value}
                        value={f.value}
                        onSelect={(currentValue) => {
                          if (currentValue === "text") {
                            updateNodeData(id, {
                              outputFormat: currentValue,
                              outputSchema: ["output.text"],
                              responseSchema: {},
                            });
                          } else {
                            handleChange("outputFormat", currentValue);
                          }
                          setOpenFormat(false);
                        }}
                      >
                        {f.label}
                        <Check
                          className={cn(
                            "ml-auto size-4",
                            outputFormat === f.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {outputFormat === "json" && (
          <div className="space-y-2 border-t pt-3 pb-3">
            <Label className="text-xs font-medium">JSON Schema</Label>
            <JsonSchema
              schema={responseSchema}
              onChange={(value) => {
                // Generate outputSchema from the new schema properties
                const newOutputSchema = Object.keys(
                  value?.properties || {}
                ).map((key) => `output.${key}`);
                updateNodeData(id, {
                  responseSchema: value,
                  outputSchema: newOutputSchema,
                });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};
