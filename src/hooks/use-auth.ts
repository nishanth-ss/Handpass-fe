// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/api"; // your Axios instance
import { useToast } from "@/hooks/use-toast";

// --- Types ---
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// --- Hook ---
export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // --- Fetch current user ---
  // const userQuery = useQuery<User | null>({
  //   queryKey: ["/api/auth/me"],
  //   queryFn: async () => {
  //     try {
  //       const { data } = await api.get("/api/auth/me");
  //       return data as User;
  //     } catch (err: any) {
  //       if (err.response?.status === 401) return null; // not logged in
  //       throw err;
  //     }
  //   },
  //   retry: false,
  // });

  // --- Login mutation ---
  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      try {
        const { data } = await api.post("/api/auth/login", credentials);
        return data as LoginResponse;
      } catch (err: any) {
        if (err.response?.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
    },
    onSuccess: (data) => {
      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Update query cache for current user
      queryClient.setQueryData(["/api/auth/me"], data.user);

      toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    },
  });

  // --- Logout mutation ---
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      // Remove token
      localStorage.removeItem("token");

      // Clear current user
      queryClient.setQueryData(["/api/auth/me"], null);

      setLocation("/login");
      toast({ title: "Logged out", description: "You have been logged out successfully." });
    },
    onError: (error) => {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    },
  });

  return {
    // user: userQuery.data,
    // isLoadingUser: userQuery.isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
