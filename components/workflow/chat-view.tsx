"use client";

import React from "react";
import { Paperclip, ArrowUp, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useWorkflow } from "@/context/workflow-context";
import { useReactFlow } from "@xyflow/react";

export const ChatView = () => {
  const { setViewport } = useReactFlow();
  const { view, setView } = useWorkflow();
  const isPreview = view === "preview";

  const handlePreviewClose = () => {
    setView("edit");
    setViewport({ x: 200, y: 0, zoom: 1.2 });
  };

  return (
    <>
      <Sheet
        open={isPreview}
        onOpenChange={(open) => !open && handlePreviewClose()}
        modal={false}
      >
        <SheetContent
          side="right"
          className="sm:max-w-lg! w-full p-0 border-l top-18! h-full max-h-[calc(100vh-5rem)] z-95 bg-card  rounded-lg! overflow-hidden shadow-lg"
          overlayClass="bg-black/5! backdrop-blur-none!"
        >
          <div className="h-full flex flex-col ">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-semibold text-sm">Preview your agent</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-muted-foreground"
              >
                New chat <Plus size={14} />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                <Sparkles size={32} className="text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Preview your agent</h3>
                <p className="text-sm text-muted-foreground max-w-70">
                  Prompt the agent as if you&apos;re the user to test the
                  workflow.
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-background/50">
              <div className="relative max-w-2xl mx-auto">
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-muted/50 border border-border focus-within:border-primary/30 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-9 w-9 text-muted-foreground"
                  >
                    <Paperclip size={18} />
                  </Button>
                  <div className="flex-1 text-sm text-muted-foreground px-2">
                    Send a message...
                  </div>
                  <Button
                    size="icon"
                    className="rounded-xl h-9 w-9 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <ArrowUp size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
