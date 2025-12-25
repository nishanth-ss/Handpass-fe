import { Layout } from "@/components/Layout";
import { useRemoteGroups } from "@/hooks/use-remote-groups";
import { Button } from "@/components/ui/button";
import { DoorOpen, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function RemoteGroupsPage() {
  const { groups, isLoading, createGroup } = useRemoteGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup(
      { groupName: name, description },
      { onSuccess: () => { setIsOpen(false); setName(""); setDescription(""); } }
    );
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Access Groups</h2>
          <p className="text-muted-foreground mt-1">Manage logical groupings of doors and devices.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Remote Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Building A - Level 2" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="All doors in Building A Level 2" />
              </div>
              <Button type="submit" className="w-full">Create Group</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading access groups...</p>
        ) : groups.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <DoorOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No access groups created yet</p>
          </div>
        ) : groups.map(group => (
          <Card key={group.id} className="group hover:shadow-lg transition-all duration-300 border-border">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DoorOpen className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="font-bold text-lg">{group.groupName}</h3>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-muted-foreground">ID: {group.id.substring(0, 8)}...</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
