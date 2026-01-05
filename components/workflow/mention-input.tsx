/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { MentionsInput, Mention } from "react-mentions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BracesIcon } from "lucide-react";
import { useWorkflow } from "@/context/workflow-context";

import { Command, CommandList, CommandItem } from "@/components/ui/command";

type Suggestion = {
  id: string;
  display: string;
  description?: string;
};

interface MentionInputComponentProps {
  value: string;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  showTriggerButton?: boolean;
  nodeId?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function MentionInputComponent({
  value,
  placeholder = "Type {{ to insert variables",
  className,
  multiline = false,
  rows = 4,
  showTriggerButton = true,
  nodeId,
  onChange,
  onBlur,
}: MentionInputComponentProps) {
  const { getVariablesForNode } = useWorkflow();

  // Generate suggestions from upstream nodes if nodeId provided
  const suggestions = React.useMemo(() => {
    if (!nodeId) return [];
    const availableNodes = getVariablesForNode(nodeId);
    const result: Suggestion[] = [];
    availableNodes.forEach((node) => {
      const nodeName = node.name.toLowerCase().replace(/ /g, "_");

      // Loop through outputs from node data
      node.outputs?.forEach((output: string) => {
        result.push({
          id: `${node.nodeId}.${output}`,
          display: `${nodeName}.${output}`,
          //id: `${node.id}.${output}`
        });
      });
    });

    return result;
  }, [nodeId, getVariablesForNode]);

  const handleTriggerClick = () => {
    onChange(value + "{{");
  };

  const mentionsStyle: any = {
    control: {
      backgroundColor: "transparent",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
      border: "none",
    },

    highlighter: {
      padding: "8px",
      minHeight: 120,
      maxHeight: 200,
      overflowY: "auto",
      boxSizing: "border-box",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
    },

    input: {
      padding: "8px",
      minHeight: 120,
      maxHeight: 200,
      overflowY: "auto",
      boxSizing: "border-box",
      border: "none",
      outline: "none",
      resize: "none",
      backgroundColor: "transparent",
      color: "inherit",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      fontSize: 14,
      lineHeight: "20px",
      fontFamily: "inherit",
    },
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-md border border-input bg-background text-sm text-foreground",
        className
      )}
    >
      <MentionsInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        singleLine={!multiline}
        placeholder={placeholder}
        spellCheck="false"
        style={mentionsStyle}
        customSuggestionsContainer={(children) => (
          <div className="fixed bg-popover z-999! min-w-64 max-w-2xl rounded-lg border shadow-lg right-10!">
            <Command>
              <CommandList className="max-h-64 overflow-y-auto">
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
          appendSpaceOnAdd
          className="mentions__mention bg-primary/20!"
          renderSuggestion={(entry, _search, _highlighted, _index, focused) => (
            <CommandItem
              value={entry.display}
              className={cn(
                "flex justify-between text-sm",
                focused && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex flex-1 items-start gap-2">
                📃
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
