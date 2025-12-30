"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Workflow } from "lucide-react";
import WorkFlowCard from "./workflow-card";
import { useGetWorkflows, useCreateWorkflow } from "@/features/use-workflow";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

const MainContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending } = useGetWorkflows();

  const workflows = data || [];

  return (
    <div className="min-h-auto bg-background">
      <div className="py-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Build a chat agent workflow with custom logic and tools
            </p>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <Plus size={18} />
            New Workflow
          </Button>
        </div>

        {/* Workflows Grid Section */}
        <div>
          {isPending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-40" />
              ))}
            </div>
          ) : workflows?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workflows.map((workflow) => (
                <WorkFlowCard
                  key={workflow.id}
                  id={workflow.id}
                  name={workflow.name}
                  description={workflow.description || ""}
                  createdAt={workflow.createdAt}
                />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Workflow />
                </EmptyMedia>
                <EmptyTitle>No Workflows Found</EmptyTitle>
                <EmptyDescription>
                  You have not created any workflows yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
      {/* Create Project Dialog */}
      <CreateWorkflowDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

function CreateWorkflowDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { mutate: createWorkflow, isPending } = useCreateWorkflow();
  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (values: WorkflowFormData) => {
    createWorkflow(values, {
      onSuccess: () => {
        form.reset();
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Enter a name for your new AI workflow
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Customer Support Bot"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., This workflow handles customer support inquiries."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                Create Workflow
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default MainContent;
