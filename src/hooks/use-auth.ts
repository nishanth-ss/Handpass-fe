// hooks/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "./AuthContext";

export function useAuth() {
  const { setUser } = useAuthContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post("/api/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
      });

      setLocation("/dashboard", { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      localStorage.clear();
      setUser(null);
      setLocation("/login", { replace: true });
    },
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
