/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { MentionsInput, Mention } from "react-mentions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BracesIcon, Variable } from "lucide-react";
import { useWorkflow } from "@/context/workflow-context";
import { NODE_CONFIG, NodeType } from "@/constant/canvas";

import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

type Suggestion = {
  id: string;
  display: string;
  description?: string;
};

interface MentionInputComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  suggestions?: Suggestion[];
  showTriggerButton?: boolean;
  nodeId?: string;
}

export function MentionInputComponent({
  value,
  onChange,
  placeholder = "Type {{ to insert variables",
  className,
  multiline = false,
  rows = 4,
  suggestions: customSuggestions = [],
  showTriggerButton = true,
  nodeId,
}: MentionInputComponentProps) {
  const { getVariablesForNode, nodes } = useWorkflow();

  // Generate suggestions from upstream nodes if nodeId provided
  const suggestions = React.useMemo(() => {
    if (!nodeId) return customSuggestions;

    const filteredNodes = getVariablesForNode(nodeId);
    const result: Suggestion[] = [];

    filteredNodes.forEach((node) => {
      const nodeData = nodes.find((n) => n.id === node.id);
      if (!nodeData) return;
      const config = NODE_CONFIG[nodeData.type as NodeType];
      config?.outputs().forEach((output: any) => {
        result.push({
          id: `${node.id}.${output.id}`,
          display: `${node.name}.${output.id}`,
          description: output.type,
        });
      });
    });

    return result;
  }, [nodeId, nodes, getVariablesForNode, customSuggestions]);

  const handleTriggerClick = () => {
    onChange(value + "{{");
  };

  const wrapperClass = cn(
    "relative w-full rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]",
    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
    "disabled:cursor-not-allowed disabled:opacity-50",
    multiline ? "min-h-18" : "h-9",
    "p-2",
    className
  );

  const mentionsStyle: any = {
    control: {
      backgroundColor: "transparent",
    },
    highlighter: {
      border: 0,
      pointerEvents: "none",
      zIndex: 999,
      color: "inherit",
      backgroundColor: "transparent",
    },
    input: {
      background: "transparent",
      border: 0,
      outline: "none",
      color: "inherit",
      //padding: multiline ? "0.5rem 0.625rem" : "0.25rem 0.625rem",
      resize: multiline ? "vertical" : "none",
      minHeight: multiline ? rows * 24 : undefined,
      fontSize: "inherit",
    },
  };

  return (
    <div className={wrapperClass}>
      <MentionsInput
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        singleLine={!multiline}
        placeholder={placeholder}
        allowSuggestionsAboveCursor={false}
        spellCheck="false"
        style={mentionsStyle}
        className={cn(
          "relative w-full",
          "[&_textarea]:text-base [&_textarea]:md:text-sm",
          "[&_textarea]:placeholder:text-muted-foreground",
          "[&_textarea]:w-full [&_textarea]:outline-none"
        )}
        customSuggestionsContainer={(children) => (
          <div className="z-50 w-56 rounded-lg border border-border bg-popover shadow-md">
            <Command>
              <CommandList className="max-h-64 overflow-y-auto">
                {React.Children.count(children) === 0 && (
                  <CommandEmpty>No variables found</CommandEmpty>
                )}
                {children}
              </CommandList>
            </Command>
          </div>
        )}
      >
        <Mention
          trigger="{{"
          data={suggestions}
          markup="{{__id__}}"
          displayTransform={(id) => `{{${id}}}`}
          appendSpaceOnAdd={true}
          className="mention-token"
          renderSuggestion={(entry, _search, _highlighted, _index, focused) => (
            <CommandItem
              value={entry.display}
              className={cn(
                "flex justify-between text-xs",
                focused && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex flex-1 items-start gap-2">
                <Variable className="mt-0.5 size-3 text-muted-foreground" />
                <span className="font-mono truncate">{entry.display}</span>
              </div>
              <span className="text-muted-foreground">
                {(entry as Suggestion)?.description}
              </span>
            </CommandItem>
          )}
        />
      </MentionsInput>

      {showTriggerButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "absolute h-6 w-6",
            multiline ? "right-2 bottom-2" : "right-2 top-1/2 -translate-y-1/2"
          )}
          onClick={handleTriggerClick}
        >
          <BracesIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
