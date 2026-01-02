// /* eslint-disable @typescript-eslint/no-explicit-any */
// // components/workflow/mcp-dialog.tsx
// "use client";
// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Loader2 } from "lucide-react";
// import { createMCPClient } from "@ai-sdk/mcp";

// interface MCPTool {
//   name: string;
//   description: string;
//   inputSchema: any;
// }

// interface MCPDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (tools: MCPTool[]) => void;
//   initialTools?: MCPTool[];
// }

// export function MCPDialog({
//   open,
//   onOpenChange,
//   onSave,
//   initialTools = [],
// }: MCPDialogProps) {
//   const [url, setUrl] = useState("");
//   const [apiKey, setApiKey] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [tools, setTools] = useState<MCPTool[]>([]);
//   const [selectedTools, setSelectedTools] = useState<Set<string>>(
//     new Set(initialTools.map((t) => t.name))
//   );

//   const handleConnect = async () => {
//     setLoading(true);
//     try {
//       const client = await createMCPClient({
//         transport: {
//           type: "sse",
//           url,
//           headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
//         },
//       });

//       const toolSet = await client.tools();
//       const toolsArray = Object.entries(toolSet).map(([name, tool]) => ({
//         name,
//         description: tool.description || "",
//         inputSchema: tool.parameters,
//       }));

//       setTools(toolsArray);
//       await client.close();
//     } catch (error) {
//       console.error("Failed to connect:", error);
//       alert("Failed to connect to MCP server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = () => {
//     const selected = tools.filter((t) => selectedTools.has(t.name));
//     onSave(selected);
//     onOpenChange(false);
//   };

//   const toggleTool = (name: string) => {
//     setSelectedTools((prev) => {
//       const next = new Set(prev);
//       next.has(name) ? next.delete(name) : next.add(name);
//       return next;
//     });
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Configure MCP Server</DialogTitle>
//         </DialogHeader>

//         {tools.length === 0 ? (
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Server URL</Label>
//               <Input
//                 placeholder="https://your-mcp-server.com"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>API Key (Optional)</Label>
//               <Input
//                 type="password"
//                 placeholder="sk-..."
//                 value={apiKey}
//                 onChange={(e) => setApiKey(e.target.value)}
//               />
//             </div>

//             <Button
//               onClick={handleConnect}
//               disabled={!url || loading}
//               className="w-full"
//             >
//               {loading ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 "Connect"
//               )}
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-muted-foreground">
//                 {tools.length} tools available
//               </p>
//               <Button variant="ghost" size="sm" onClick={() => setTools([])}>
//                 Change Server
//               </Button>
//             </div>

//             <div className="space-y-2">
//               {tools.map((tool) => (
//                 <div
//                   key={tool.name}
//                   className="flex items-start gap-3 p-3 border rounded"
//                 >
//                   <Checkbox
//                     checked={selectedTools.has(tool.name)}
//                     onCheckedChange={() => toggleTool(tool.name)}
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium text-sm">{tool.name}</p>
//                     <p className="text-xs text-muted-foreground line-clamp-2">
//                       {tool.description}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleSave} className="flex-1">
//                 Save ({selectedTools.size} selected)
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
