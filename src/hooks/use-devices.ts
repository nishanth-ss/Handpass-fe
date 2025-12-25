// hooks/useDevices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api"; // your Axios instance
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Example Device type
export type Device = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
};

// Example schema for creating a device
export const createDeviceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
});

export type DeviceInput = z.infer<typeof createDeviceSchema>;

export function useDevices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Fetch devices ---
  const devicesQuery = useQuery<Device[]>({
    queryKey: ["/v1/device/getAll"],
    queryFn: async () => {
      const { data } = await api.post("/v1/device/getAll");
      return data?.data as Device[];
    },
  });

  // --- Create device ---
  const createDeviceMutation = useMutation<Device, Error, DeviceInput>({
    mutationFn: async (device) => {
      createDeviceSchema.parse(device); // validate input
      const { data } = await api.post("/api/devices", device);
      return data as Device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add device", description: error.message, variant: "destructive" });
    },
  });

  // --- Delete device ---
  const deleteDeviceMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device removed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete device", description: error.message, variant: "destructive" });
    },
  });

  return {
    devices: devicesQuery.data ?? [],
    isLoading: devicesQuery.isLoading,
    createDevice: createDeviceMutation.mutate,
    isCreating: createDeviceMutation.isPending,
    deleteDevice: deleteDeviceMutation.mutate,
    isDeleting: deleteDeviceMutation.isPending,
  };
}
