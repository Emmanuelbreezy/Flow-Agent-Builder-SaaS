/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionInputComponent } from "../../mention-input";

const HTTP_METHODS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

interface HttpSettingsProps {
  id: string;
  data: any;
}

export const HttpSettings = ({ id, data }: HttpSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const [openMethod, setOpenMethod] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  const method = (data?.method as string) || "GET";
  const url = (data?.url as string) || "";
  const headers = (data?.headers as Record<string, string>) || {};
  const body = (data?.body as string) || "";

  const handleChange = (key: string, value: any) => {
    updateNodeData(id, {
      [key]: value,
    });
  };

  const handleAddHeader = () => {
    if (newHeaderKey.trim()) {
      handleChange("headers", {
        ...headers,
        [newHeaderKey]: newHeaderValue,
      });
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const handleRemoveHeader = (key: string) => {
    const updated = { ...headers };
    delete updated[key];
    handleChange("headers", updated);
  };

  return (
    <div className="space-y-4 pb-3">
      {/* Method Selector */}
      <div className="flex items-center justify-between">
        <Label>HTTP Method</Label>
        <Popover open={openMethod} onOpenChange={setOpenMethod}>
          <PopoverTrigger>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openMethod}
              className="w-full justify-between"
            >
              {method || "Select method..."}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search methods..." />
              <CommandEmpty>No method found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {HTTP_METHODS.map((m) => (
                    <CommandItem
                      key={m.value}
                      value={m.value}
                      onSelect={(currentValue) => {
                        handleChange("method", currentValue);
                        setOpenMethod(false);
                      }}
                    >
                      {m.label}
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          method === m.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label>URL</Label>
        <MentionInputComponent
          nodeId={id}
          value={url}
          onChange={(value) => handleChange("url", value)}
          placeholder="https://api.example.com/endpoint"
        />
        <p className="text-xs text-muted-foreground">
          Supports variables with {`{{nodeName.outputKey}}`}
        </p>
      </div>

      {/* Headers */}
      <div className="space-y-2">
        <Label className="font-medium">Headers</Label>
        <div className="space-y-2">
          {Object.entries(headers).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded border bg-muted p-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{key}</p>
                <p className="text-xs text-muted-foreground">{value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveHeader(key)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Header name"
              value={newHeaderKey}
              onChange={(e) => setNewHeaderKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddHeader();
              }}
            />
            <Input
              placeholder="Header value"
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddHeader();
              }}
            />
            <Button onClick={handleAddHeader} size="sm">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      {["POST", "PUT", "PATCH", "DELETE"].includes(method) && (
        <div className="space-y-2">
          <Label>Body (JSON)</Label>
          <Textarea
            value={body}
            onChange={(e) => handleChange("body", e.target.value)}
            placeholder='{"key": "value"}'
            className="min-h-32 font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Supports variables with {`{{nodeName.outputKey}}`}
          </p>
        </div>
      )}

      {/* Output Schema Info */}
      <div className="space-y-2">
        <Label className="font-medium">Available Outputs</Label>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Access response data in other nodes:
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">output.status</Badge>
            <Badge variant="outline">output.headers</Badge>
            <Badge variant="outline">output.body</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            For nested fields:{" "}
            <code className="bg-muted px-1 rounded text-xs">{`{{nodeName.body.field}}`}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HttpSettings;
