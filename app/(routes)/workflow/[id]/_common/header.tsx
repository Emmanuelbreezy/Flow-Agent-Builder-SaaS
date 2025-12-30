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
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left section */}
        <Link className={`flex items-center gap-3 ${zIndex}`} href="/workflow">
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
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 z-999!">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={view === tab.id}
              onClick={() => handleSetView(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
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
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <Code className="h-3.5 w-3.5" />
            Code
          </Button>

          <Button size="sm" className={`h-8 ${zIndex}`}>
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
