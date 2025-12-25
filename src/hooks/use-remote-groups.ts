import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type RemoteGroupInput = z.infer<typeof api.remoteGroups.create.input>;

export function useRemoteGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const groupsQuery = useQuery({
    queryKey: [api.remoteGroups.list.path],
    queryFn: async () => {
      const res = await fetch(api.remoteGroups.list.path);
      if (!res.ok) throw new Error("Failed to fetch remote groups");
      return api.remoteGroups.list.responses[200].parse(await res.json());
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: RemoteGroupInput) => {
      const res = await fetch(api.remoteGroups.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create remote group");
      return api.remoteGroups.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.remoteGroups.list.path] });
      toast({ title: "Remote group created successfully" });
    },
  });

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    createGroup: createGroupMutation.mutate,
    isCreating: createGroupMutation.isPending,
  };
}
