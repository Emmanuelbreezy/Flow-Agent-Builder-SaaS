/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Server } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { addMcpServer, connectMcpServer } from "@/app/actions/action";
import { toast } from "sonner";
import { MCPToolType } from "@/lib/workflow/constants";

interface MCPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    label: string;
    serverId: string;
    selectedTools: MCPToolType[];
  }) => void;
  initialTools?: MCPToolType[];
}

export function MCPDialog({ open, onOpenChange, onAdd }: MCPDialogProps) {
  const [step, setStep] = useState<"connect" | "select">("connect");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<MCPToolType[]>([]);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { tools } = await connectMcpServer({
        url,
        apiKey,
      });
      setTools(tools);
      // Set the selected tools
      setSelectedTools(new Set(tools.map((t: any) => t.name)));
      setStep("select");
      toast.success("Connected to MCP server");
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Failed to connect to MCP server");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const selected = tools.filter((t) => selectedTools.has(t.name));
    setLoading(true);
    try {
      // Call addConnectMcpServer to get the serverId
      const { serverId } = await addMcpServer({
        url,
        apiKey,
        label,
      });
      onAdd({
        label,
        serverId,
        selectedTools: selected,
      });
      onOpenChange(false);
      setStep("connect");
      setUrl("");
      setLabel("");
      setApiKey("");
      setTools([]);
      setSelectedTools(new Set());
      toast.success("MCP server added successfully");
    } catch (error) {
      console.error("Failed to save MCP server:", error);
      toast.error("Failed to save MCP server");
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (name: string) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const authList = [{ value: "token", label: "Access token / API key" }];

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg " overlayClass="bg-black/60! z-999!">
          {step === "connect" ? (
            <div className="p-8">
              <div className="flex flex-col items-center mb-6">
                <Server className="w-8 h-8 mb-2 text-muted-foreground" />
                <DialogTitle className="text-center text-lg font-semibold">
                  Connect to MCP Server
                </DialogTitle>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mcp-url">URL</Label>
                  <InputGroup>
                    <Input
                      id="mcp-url"
                      placeholder="https://mcp.example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      autoComplete="off"
                    />
                  </InputGroup>
                  <div className="text-xs text-muted-foreground mt-1">
                    Only use MCP servers you trust and verify
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcp-label">Label</Label>
                  <InputGroup>
                    <Input
                      id="mcp-label"
                      name="mcp-label"
                      placeholder="my_mcp_server"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      autoComplete="off"
                    />
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcp-auth">Authentication</Label>
                  <Select disabled items={authList} value="token">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authList.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative mt-2">
                    <InputGroup>
                      <InputGroupAddon>
                        <KeyRound className="w-4 h-4 " />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="password"
                        name="mcp-api-key"
                        placeholder="Add your access token"
                        value={apiKey}
                        onChange={(e: any) => setApiKey(e.target.value)}
                        autoComplete="off"
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleConnect}
                    disabled={!url || !label || !apiKey || loading}
                    className="w-32"
                  >
                    {loading && <Spinner />}
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-base">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{url}</span>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-sm mb-2">TOOLS</div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <Checkbox
                        checked={selectedTools.has(tool.name)}
                        onCheckedChange={() => toggleTool(tool.name)}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-xs">{tool.name}</h5>
                        <p
                          className="block text-xs text-muted-foreground
                      line-clamp-1 truncate max-w-75"
                        >
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  onClick={handleAdd}
                  className="flex-1"
                >
                  {loading ? (
                    <Spinner />
                  ) : (
                    `Add (${selectedTools.size} selected)`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
