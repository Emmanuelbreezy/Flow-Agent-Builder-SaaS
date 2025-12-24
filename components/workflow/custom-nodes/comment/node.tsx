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
        "w-full h-full box-border px-2 py-1 border rounded-lg transition-all duration-400 bg-amber-300 dark:bg-[#b08915]"
      )}
      style={{
        width: "100%",
        height: "100%",
        minWidth: "150px",
        minHeight: "80px",
      }}
    >
      <Textarea
        value={comment || ""}
        onChange={(e) => setComment(e.target.value)}
        placeholder="write a note..."
        className="w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs shadow-none
        dark:placeholder:text-black"
      />
    </div>
  );
};

export default CommentNode;
