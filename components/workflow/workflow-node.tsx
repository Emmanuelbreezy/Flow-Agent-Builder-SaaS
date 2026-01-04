import React from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "./react-flow/base-node";
import { LucideIcon, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "../ui/button-group";
import { NodeStatusIndicator } from "./react-flow/node-status-indicator";
import { BaseHandle } from "./react-flow/base-handle";
import { Position, useReactFlow } from "@xyflow/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";

interface WorkflowNodeProps {
  nodeId: string;
  label: string;
  subText: string;
  icon: LucideIcon;
  handles: { target: boolean; source: boolean };
  isDeletable?: boolean;
  selected?: boolean;
  color?: string;
  status?: "initial" | "loading" | "error" | "success";
  className?: string;
  children?: React.ReactNode;
  settingComponent?: React.ReactNode;
  settingsTitle?: string;
  settingsDescription?: string;
}

const WorkflowNode = ({
  nodeId,
  label,
  subText,
  isDeletable = true,
  icon: Icon,
  handles,
  selected,
  color = "bg-gray-500",
  status = "initial",
  className,
  children,
  settingComponent,
  settingsTitle,
  settingsDescription,
}: WorkflowNodeProps) => {
  const { deleteElements } = useReactFlow();

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const onDelete = () => {
    if (!isDeletable) {
      toast.error("Cannot delete this node");
      return; // Prevent deleting the node
    }
    deleteElements({ nodes: [{ id: nodeId }] });
  };

  return (
    <>
      <div>
        <div className="relative">
          <NodeStatusIndicator status={status} variant="border">
            <BaseNode
              className={cn("min-w-36 w-fit cursor-pointer", className)}
              onDoubleClick={(e) => {
                if (!settingComponent) return;
                e.stopPropagation();
                setSettingsOpen(true);
              }}
            >
              <BaseNodeHeader className="flex items-start px-2 pt-3 pb-3.5">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "rounded-sm! size-7 flex items-center justify-center",
                      color
                    )}
                  >
                    <Icon className="size-3.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <BaseNodeHeaderTitle className="text-sm! pr-2 font-medium!">
                      {label}
                    </BaseNodeHeaderTitle>
                    {subText && (
                      <p className="text-[11px] text-muted-foreground -mt-0.5 truncate max-w-20">
                        {subText}
                      </p>
                    )}
                  </div>
                </div>

                {selected && (
                  <ButtonGroup className="flex items-center -mt-px">
                    {settingComponent && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6! hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSettingsOpen(true);
                        }}
                      >
                        <Settings className="size-3" />
                      </Button>
                    )}

                    {isDeletable && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6! hover:bg-destructive/10 hover:text-destructive -ml-px"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.();
                        }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </ButtonGroup>
                )}
              </BaseNodeHeader>

              {children && (
                <BaseNodeContent className="px-2 pt-0!">
                  {children}
                </BaseNodeContent>
              )}
              {handles.target && (
                <BaseHandle
                  id="target-1"
                  type="target"
                  className="size-2!"
                  position={Position.Left}
                />
              )}

              {handles.source && (
                <BaseHandle
                  id="source-1"
                  type="source"
                  className="size-2!"
                  position={Position.Right}
                />
              )}
            </BaseNode>
          </NodeStatusIndicator>
        </div>
      </div>

      {/* Settings Dialog */}
      {settingComponent && (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent
            className="max-w-md!  px-0! pb-2!"
            overlayClass="bg-black/10! backdrop-blur-none!"
          >
            <DialogHeader className="px-4">
              <DialogTitle>{settingsTitle || `${label} Settings`}</DialogTitle>
              {settingsDescription && (
                <DialogDescription>{settingsDescription}</DialogDescription>
              )}
            </DialogHeader>
            <div className="px-4 space-y-4 h-full max-h-[65vh] overflow-y-auto">
              {settingComponent}
            </div>
            <DialogFooter className="px-4 border-t pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default WorkflowNode;
