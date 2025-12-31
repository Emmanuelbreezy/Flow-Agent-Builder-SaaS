import { Workflow } from "@/lib/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useWorkflowStore } from "@/store/workflow-store";
import { Node, Edge } from "@xyflow/react";

export const useCreateWorkflow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) =>
      await axios
        .post("/api/workflow", {
          name,
          description,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow created successfully");
      router.push(`/workflow/${data.data.id}`);
    },
    onError: (error) => {
      console.log("Workflow failed", error);
      toast.error("Failed to create workflow");
    },
  });
};

export const useGetWorkflows = () => {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await axios.get<{ data: Workflow[] }>("/api/workflow");
      console.log(res.data.data, "workflows fetched");
      return res.data.data;
    },
  });
};

interface WorkflowWithFlowObject {
  id: string;
  name: string;
  userId: string;
  flowObject: {
    nodes: Node[];
    edges: Edge[];
  };
}

export const useGetWorkflow = (workflowId: string) => {
  const { setSavedState } = useWorkflowStore();
  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const res = await axios.get<{ data: WorkflowWithFlowObject }>(
        `/api/workflow/${workflowId}`
      );
      const result = res.data.data;
      setSavedState(result.flowObject.nodes, result.flowObject.edges);
      return result;
    },
    enabled: !!workflowId,
  });
};

export const useUpdateWorkflow = (workflowId: string) => {
  const { setSavedState } = useWorkflowStore();
  return useMutation({
    mutationFn: async (data: { nodes: Node[]; edges: Edge[] }) =>
      await axios
        .put(`/api/workflow/${workflowId}`, data)
        .then((res) => res.data),
    onSuccess: (data) => {
      const result = data.data;
      setSavedState(result.flowObject.nodes, result.flowObject.edges);
      toast.success("Workflow saved successfully");
    },
    onError: (error) => {
      console.log("Update workflow failed", error);
      toast.error("Failed to save workflow");
    },
  });
};
