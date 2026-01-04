"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Code, MoreHorizontal, Pencil, Play } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWorkflow } from "@/context/workflow-context";
import CodeDialog from "@/components/workflow/code-dialog";

export function WorkflowHeader({ name }: { name?: string }) {
  const { view, setView } = useWorkflow();

  const tabs = [
    { id: "edit", label: "Edit", icon: Pencil },
    { id: "preview", label: "Preview", icon: Play },
  ] as const;

  const zIndex = view === "preview" ? "z-99" : "";

  const handleSetView = (tabId: "edit" | "preview") => {
    setView(tabId);
  };

  return (
    <div className="relative">
      <header className="w-full bg-transparent absolute top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4 ">
          {/* Left section */}
          <Link
            className={`flex items-center gap-3 ${zIndex} bg-card py-1 pl-1 pr-4 rounded-lg`}
            href="/workflow"
          >
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold truncate max-w-50">
                {name || "Untitled Workflow"}
              </h1>
            </div>
          </Link>

          {/* Center section - Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1 mt-1 z-999!">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSetView(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    view === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right section */}
          <div className=" flex items-center gap-2 bg-card p-1 rounded-lg">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8" />
                }
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Code
            </Button> */}
            <CodeDialog />
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${zIndex}`}
            ></Button>
          </div>
        </div>
      </header>
    </div>
  );
}
