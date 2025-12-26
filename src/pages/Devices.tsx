import { Layout } from "@/components/Layout";
import { useDevices } from "@/hooks/use-devices";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone, Trash2, Plus, Signal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function DevicesPage() {
  const { devices, isLoading, createDevice, deleteDevice } = useDevices();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ip, setIp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDevice(
      { deviceName: name, location, ipAddress: ip }, 
      { onSuccess: () => { setIsOpen(false); setName(""); setLocation(""); setIp(""); } }
    );
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
              Register Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Device Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Main Entrance Cam" required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Building A, Lobby" required />
              </div>
              <div className="space-y-2">
                <Label>IP Address</Label>
                <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.10" />
              </div>
              <Button type="submit" className="w-full">Register</Button>
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
              <h3 className="font-bold text-lg">{device.deviceName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                {device.location}
              </p>
              <div className="mt-4 p-3 bg-muted/40 rounded-lg text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>IP: {device.device_ip || "Dynamic"}</span>
                <Signal className="w-3 h-3 text-emerald-500" />
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end">
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
