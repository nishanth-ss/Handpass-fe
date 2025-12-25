// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api"; // your Axios instance
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// --- User types ---
export type User = {
  id: string;
  name: string;
  email: string;
};

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export type UserInput = z.infer<typeof createUserSchema>;

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Fetch users ---
  const usersQuery = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const { data } = await api.get("/api/users");
      return data?.data as User[];
    },
  });

  // --- Create user ---
  const createUserMutation = useMutation<User, Error, UserInput>({
    mutationFn: async (user) => {
      createUserSchema.parse(user); // validate input
      const { data } = await api.post("/api/users", user);
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create user", description: error.message, variant: "destructive" });
    },
  });

  // --- Delete user ---
  const deleteUserMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
  };
}
