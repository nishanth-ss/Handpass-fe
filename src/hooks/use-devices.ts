// hooks/useDevices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api"; // your Axios instance
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Device type matching the backend and component structure
export interface Device {
  id?: string;
  device_name: string;
  location: string;
  device_ip: string;
};

// Schema for creating/updating a device
export const createDeviceSchema = z.object({
  device_name: z.string().min(1, "Device name is required"),
  location: z.string().min(1, "Location is required"),
  device_ip: z.string().min(1, "IP address is required"),
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

   // --- Update device ---
  const updateDeviceMutation = useMutation<Device, Error, DeviceInput>({
    mutationFn: async (device: any) => {
      createDeviceSchema.parse(device); // validate input
      const { data } = await api.put(`/v1/connect/${device.id}`, device);
      return data as Device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device updated successfully" });
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
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({ title: "Device removed" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete device", description: error.message, variant: "destructive" });
    },
  });

  // Wrap the delete mutation to handle the device object
  const deleteDevice = (device: Device | string) => {
    const deviceId = typeof device === 'string' ? device : device.id;
    if (!deviceId) {
      console.error('Cannot delete device: No ID provided');
      return;
    }
    return deleteDeviceMutation.mutate(deviceId);
  };

  return {
    devices: devicesQuery.data ?? [],
    isLoading: devicesQuery.isLoading,
    createDevice: createDeviceMutation.mutate,
    isCreating: createDeviceMutation.isPending,
    deleteDevice,
    isDeleting: deleteDeviceMutation.isPending,
    updateDevice: updateDeviceMutation.mutate,
    isUpdating: updateDeviceMutation.isPending,
  };
}
