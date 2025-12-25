"use client";
import React from "react";
import { NodeProps } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CommentNode = ({ data }: NodeProps) => {
  const commentStr = (data?.comment as string) || "";
  const [comment, setComment] = React.useState(commentStr);

  return (
    <div
      className={cn(
        `w-full h-full box-border px-2 py-1 border rounded-lg transition-all duration-400
       bg-amber-300 dark:bg-[#b08915]`
      )}
      style={{
        width: "200px",
        height: "100%",
        minHeight: "80px",
        maxHeight: "200px",
      }}
    >
      <Textarea
        value={comment || ""}
        onChange={(e) => setComment(e.target.value)}
        placeholder="write a note..."
        className="w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs shadow-none overflow-auto scrollbar-thin! scrollbar-thumb-gray-400! scrollbar-track-transparent
      dark:placeholder:text-black max-h-[150px] min-h-[80px]"
      />
    </div>
  );
};

export default CommentNode;
