"use client";
import React from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CommentNode = ({ data, id }: NodeProps) => {
  const { updateNodeData } = useReactFlow();
  const comment = data?.comment as string;

  const handleCommentChange = (value: string) => {
    updateNodeData(id, { comment: value });
  };

  return (
    <div
      className={cn(
        `w-full h-full box-border px-1 py-1 border rounded-lg transition-all duration-400
       bg-amber-300 dark:bg-[#b08915]`
      )}
      style={{
        width: "155px",
        height: "100%",
        minHeight: "70px",
        maxHeight: "180px",
      }}
    >
      <Textarea
        value={comment || ""}
        onChange={(e) => handleCommentChange(e.target.value)}
        placeholder="write a comment..."
        className="w-full h-full px-1! resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs! shadow-none overflow-auto scrollbar-thin! scrollbar-thumb-gray-400! scrollbar-track-transparent
       max-h-37.5 min-h-20"
      />
    </div>
  );
};

export default CommentNode;
