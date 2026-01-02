/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { MentionInputComponent } from "../../mention-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HttpSettingsProps {
  id: string;
  data: any;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

interface HttpSettingsProps {
  id: string;
  data: any;
}

export const HttpSettings = ({ id, data }: HttpSettingsProps) => {
  const { updateNodeData } = useReactFlow();
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  const { method = "GET", url = "", headers = {}, body = "" } = data || {};

  const handleChange = (key: string, value: any) => {
    updateNodeData(id, { [key]: value });
  };

  const handleAddHeader = () => {
    if (newHeaderKey.trim()) {
      handleChange("headers", { ...headers, [newHeaderKey]: newHeaderValue });
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const handleRemoveHeader = (key: string) => {
    const { [key]: _, ...rest } = headers;
    handleChange("headers", rest);
  };

  return (
    <div className="space-y-4 pb-3">
      {/* Method */}
      <div className="space-y-2">
        <Label>HTTP Method</Label>
        <Select value={method} onValueChange={(v) => handleChange("method", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label>URL</Label>
        <MentionInputComponent
          nodeId={id}
          value={url}
          multiline={false}
          onChange={(v) => handleChange("url", v)}
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      {/* Headers */}
      <div className="space-y-2">
        <Label>Headers</Label>
        {Object.entries(headers).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-2 p-2 border rounded bg-muted"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{key}</p>
              <p className="text-xs text-muted-foreground truncate">
                {value as string}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveHeader(key)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Key"
            value={newHeaderKey}
            spellCheck={false}
            onChange={(e) => setNewHeaderKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHeader()}
          />
          <Input
            placeholder="Value"
            value={newHeaderValue}
            spellCheck={false}
            onChange={(e) => setNewHeaderValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHeader()}
          />
          <Button onClick={handleAddHeader} size="icon">
            <Plus className="size-4" />
          </Button>
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
            spellCheck={false}
            className="min-h-32 font-mono text-xs"
          />
        </div>
      )}

      {/* Output Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Access response:{" "}
          <code className="bg-muted px-1 rounded">{`{{${id}.output.body}}`}</code>
        </p>
        <p>
          Nested fields:{" "}
          <code className="bg-muted px-1 rounded">{`{{${id}.output.body.field}}`}</code>
        </p>
      </div>
    </div>
  );
};

export default HttpSettings;

// export const HttpSettings = ({ id, data }: HttpSettingsProps) => {
//   const { updateNodeData } = useReactFlow();
//   const [openMethod, setOpenMethod] = useState(false);
//   const [newHeaderKey, setNewHeaderKey] = useState("");
//   const [newHeaderValue, setNewHeaderValue] = useState("");

//   const method = (data?.method as string) || "GET";
//   const url = (data?.url as string) || "";
//   const headers = (data?.headers as Record<string, string>) || {};
//   const body = (data?.body as string) || "";
//   const formattedBody = JSON.stringify(body || "{}", null, 2);

//   const handleChange = (key: string, value: any) => {
//     updateNodeData(id, {
//       [key]: value,
//     });
//   };

//   const handleAddHeader = () => {
//     if (newHeaderKey.trim()) {
//       handleChange("headers", {
//         ...headers,
//         [newHeaderKey]: newHeaderValue,
//       });
//       setNewHeaderKey("");
//       setNewHeaderValue("");
//     }
//   };

//   const handleRemoveHeader = (key: string) => {
//     const updated = { ...headers };
//     delete updated[key];
//     handleChange("headers", updated);
//   };

//   return (
//     <div className="space-y-4 pb-3">
//       {/* Method Selector */}
//       <div className="flex items-center justify-between">
//         <Label>HTTP Method</Label>
//         <Popover open={openMethod} onOpenChange={setOpenMethod}>
//           <PopoverTrigger>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={openMethod}
//               className="w-full justify-between"
//             >
//               {method || "Select method..."}
//               <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-full p-0" align="start">
//             <Command>
//               <CommandInput placeholder="Search methods..." />
//               <CommandEmpty>No method found.</CommandEmpty>
//               <CommandGroup>
//                 <CommandList>
//                   {HTTP_METHODS.map((m) => (
//                     <CommandItem
//                       key={m.value}
//                       value={m.value}
//                       onSelect={(currentValue) => {
//                         handleChange("method", currentValue);
//                         setOpenMethod(false);
//                       }}
//                     >
//                       {m.label}
//                       <Check
//                         className={cn(
//                           "ml-auto size-4",
//                           method === m.value ? "opacity-100" : "opacity-0"
//                         )}
//                       />
//                     </CommandItem>
//                   ))}
//                 </CommandList>
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* URL Input */}
//       <div className=" space-y-2">
//         <Label>URL</Label>
//         <MentionInputComponent
//           nodeId={id}
//           value={url}
//           multiline={false}
//           onChange={(value) => handleChange("url", value)}
//           placeholder="https://api.example.com/endpoint"
//         />
//         <p className="text-xs text-muted-foreground">
//           Supports variables with {`{{prevNodeId.output.key}}`}
//         </p>
//       </div>

//       {/* Headers */}
//       <div className="space-y-2">
//         <Label className="font-medium">Headers</Label>
//         <div className="space-y-2">
//           {Object.entries(headers).map(([key, value]) => (
//             <div
//               key={key}
//               className="flex items-center gap-2 rounded border bg-muted p-2"
//             >
//               <div className="flex-1">
//                 <p className="text-sm font-medium">{key}</p>
//                 <p className="text-xs text-muted-foreground">{value}</p>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleRemoveHeader(key)}
//               >
//                 <X className="size-4" />
//               </Button>
//             </div>
//           ))}
//           <div className="flex gap-2">
//             <Input
//               placeholder="Header name"
//               value={newHeaderKey}
//               onChange={(e) => setNewHeaderKey(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleAddHeader();
//               }}
//             />
//             <Input
//               placeholder="Header value"
//               value={newHeaderValue}
//               onChange={(e) => setNewHeaderValue(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleAddHeader();
//               }}
//             />
//             <Button onClick={handleAddHeader} size="sm">
//               <Plus className="size-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       {["POST", "PUT", "PATCH", "DELETE"].includes(method) && (
//         <div className="space-y-2">
//           <Label>Body (JSON)</Label>
//           <Textarea
//             value={body}
//             onChange={(e) => handleChange("body", e.target.value)}
//             placeholder='{"key": "value"}'
//             className="min-h-32"
//           />
//           <p className="text-xs text-muted-foreground">
//             Supports variables with {`{{prevNodeId.output.key}}`}
//           </p>
//         </div>
//       )}

//       {/* Output Schema Info */}
//       <div className="space-y-2">
//         <Label className="font-medium">Available Outputs</Label>
//         <div className="space-y-2">
//           <p className="text-xs text-muted-foreground mt-2">
//             For nested fields:{" "}
//             <code className="bg-muted px-1 rounded text-xs">{`{{${id}.output.body.field}}`}</code>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HttpSettings;
