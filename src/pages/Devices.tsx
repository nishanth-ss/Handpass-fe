import { Layout } from "@/components/Layout";
import { useDevices } from "@/hooks/use-devices";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Trash2, Plus, Signal, Pencil } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";

interface Device {
  id?: string;
  device_name: string;
  location: string;
  device_ip: string;
}

export default function DevicesPage() {
  const { devices, isLoading, createDevice, deleteDevice,updateDevice } = useDevices();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ip, setIp] = useState("");
  const [editMode, setEditMode] = useState<Partial<Device>>({});

  console.log(Object.keys(editMode).length > 0);
  // console.log("name",name);
  
  useEffect(() => {
    console.log("editMode changed:", editMode);
    if (Object.keys(editMode).length > 0) {
      console.log("Setting form values for edit mode");
      console.log("editMode?.device_name",editMode?.device_ip);
      
      setName(editMode.device_name || '');
      setLocation(editMode.location || '');
      setIp(editMode.device_ip || '');
    }
  }, [editMode]);
  // This will help debug the state changes
  useEffect(() => {
    console.log("Current editMode:", editMode);
  }, [editMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deviceData = {
      device_name: name,
      location,
      device_ip: ip
    };
     const mutationOptions = {
    onSuccess: () => {
      setIsOpen(false);
      resetForm();
      
    }
  };
    if (editMode.id) {
      // Handle update logic here if you have an update function
         updateDevice({ id: editMode.id, ...deviceData }, mutationOptions);

    } else {
      createDevice(deviceData, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };
  // Add this helper function to reset the form
  const resetForm = () => {
    setName('');
    setLocation('');
    setIp('');
    setEditMode({});
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Device Management</h2>
          <p className="text-muted-foreground mt-1">Manage physical access terminals and cameras.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              {editMode.id ? "Edit" : "Register"} Device
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{editMode.id ? "Edit" : "Register"} Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2 flex flex-col">
                <Label>Device Name</Label>
                <TextField size="small" value={name} onChange={e => setName(e.target.value)} placeholder="Main Entrance Cam" required />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>Location</Label>
                <TextField size="small" value={location} onChange={e => setLocation(e.target.value)} placeholder="Building A, Lobby" />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>IP Address</Label>
                <TextField size="small" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.10" />
              </div>
              <Button type="submit" className="w-full text-white">{editMode.id ? "Update" : "Register"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading devices...</p>
        ) : devices.map((device: any) => (
          <Card key={device.id} className="group hover:shadow-lg transition-all duration-300 border-border">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MonitorSmartphone className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="font-bold text-lg">{device.device_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                {device.location}
              </p>
              <div className="mt-4 p-3 bg-muted/40 rounded-lg text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>IP: {device.device_ip || "Dynamic"}</span>
                <Signal className="w-3 h-3 text-emerald-500" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"
                onClick={() => { setIsOpen(true); setEditMode(device) }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteDevice(device.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
