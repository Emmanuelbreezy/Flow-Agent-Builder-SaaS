"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import AgentCard from "./_common/agent-card";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "New agent",
      description: "AI-powered chatbot for customer queries",
      createdAt: "Dec 21, 04:27 PM",
    },
    {
      id: "2",
      name: "Content Generator",
      description: "Automated content creation workflow",
      createdAt: "1 week ago",
    },
  ]);

  const templates: Template[] = [
    {
      id: "1",
      name: "Blank Workflow",
      description: "Start from scratch",
      icon: "📝",
    },
    {
      id: "2",
      name: "Customer Support",
      description: "Pre-built support template",
      icon: "💬",
    },
    {
      id: "3",
      name: "Content Workflow",
      description: "Content creation template",
      icon: "✍️",
    },
    {
      id: "4",
      name: "Data Processing",
      description: "Data workflow template",
      icon: "📊",
    },
  ];

  const handleCreateWorkflow = () => {
    if (workflowName.trim()) {
      const newWorkflow: Project = {
        id: String(projects.length + 1),
        name: workflowName,
        description: "New workflow project",
        createdAt: "just now",
      };
      setProjects([newWorkflow, ...projects]);
      setWorkflowName("");
      setIsCreateDialogOpen(false);
      router.push(`/workflow/${newWorkflow.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Build a chat agent workflow with custom logic and tools
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={18} />
            New Workflow
          </Button>
        </div>

        {/* Templates Section */}
        <div className="mb-7">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Templates
          </h2>
          <div className="flex gap-4 pb-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="shrink-0 w-48 p-2 flex flex-row items-center cursor-pointer hover:shadow-md transition-shadow gap-1 rounded-sm!"
              >
                <span className="text-sm">{template.icon}</span>
                <h3 className="font-medium text-foreground">{template.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Projects Grid Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Agents
          </h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <AgentCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  createdAt={"Dec 21, 04:27 PM"}
                  author="Emmanuel Umeh"
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No agents yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>
      </div>
      {/* Create Project Dialog */}
      <CreateWorkflowDialog
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        handleCreateWorkflow={handleCreateWorkflow}
      />
    </div>
  );
};

function CreateWorkflowDialog({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  workflowName,
  setWorkflowName,
  handleCreateWorkflow,
}: {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  workflowName: string;
  setWorkflowName: (name: string) => void;
  handleCreateWorkflow: () => void;
}) {
  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Enter a name for your new AI workflow
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-2">
            <Label htmlFor="agent-name">Workflow Name</Label>
            <Input
              id="agent-name"
              placeholder="e.g., Customer Support Bot"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Dashboard;
