"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkFlowCardProps {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
}

const WorkFlowCard: React.FC<WorkFlowCardProps> = ({
  id,
  name,
  description,
  createdAt,
}) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/workflow/${id}`)}
      className="relative cursor-pointer py-5 hover:shadow-md transition-shadow"
    >
      <CardContent className="space-y-5">
        <div>
          {/* Top Icon Section */}
          <div className="mb-3 relative">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <WorkflowIcon size={22} />
            </div>
            {/*
            <Button
              size="icon-sm"
              variant="ghost"
              className="absolute right-0 top-0 text-xs text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workflow/${id}`);
              }}
            >
              Edit
            </Button> */}
          </div>

          {/* Content */}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 text-ellipsis">
              {description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground/70 font-medium">
          <span>{format(new Date(createdAt), "MMM d, yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkFlowCard;
