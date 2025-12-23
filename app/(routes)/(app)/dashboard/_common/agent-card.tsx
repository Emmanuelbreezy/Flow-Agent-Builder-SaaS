"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { WorkflowIcon } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  createdAt: string;
  author: string;
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  author,
  createdAt,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className="group relative flex flex-col justify-between p-5 cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary/20 border border-border bg-card hover:bg-accent/5"
    >
      <div>
        {/* Top Icon Section */}
        <div className="mb-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
            <WorkflowIcon size={22} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-base leading-tight">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Custom AI Agent workflow
          </p>
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="pt-1 flex items-center justify-between text-xs capitalize tracking-wider text-muted-foreground/70 font-medium">
        <span>{createdAt}</span>
        <span>{author}</span>
      </div>
    </Card>
  );
};

export default AgentCard;
