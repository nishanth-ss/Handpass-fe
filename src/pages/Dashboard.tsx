import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { useReports } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-users";
import { useDevices } from "@/hooks/use-devices";
import { Users, MonitorSmartphone, ShieldAlert, KeyRound } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function Dashboard() {
  const { accessLogs, isLoading } = useReports();
  const { users } = useUsers();
  const { devices } = useDevices();

  // Calculate simple stats
  const totalUsers = users.length;
  const totalDevices = devices.length;
  const recentLogs = accessLogs.slice(0, 50); // Last 50 logs
  const deniedAccess = recentLogs.filter((log: any) => log.result === "DENIED").length;
  const grantedAccess = recentLogs.filter((log: any) => log.result === "GRANTED").length;

  // Prepare chart data (access per day/hour - simplified for demo)
  const chartData = [
    { name: 'Mon', granted: 40, denied: 2 },
    { name: 'Tue', granted: 30, denied: 1 },
    { name: 'Wed', granted: 45, denied: 5 },
    { name: 'Thu', granted: 25, denied: 0 },
    { name: 'Fri', granted: 55, denied: 3 },
    { name: 'Sat', granted: 10, denied: 1 },
    { name: 'Sun', granted: 5, denied: 0 },
  ];

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">System overview and activity monitoring.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full font-medium">
          {format(new Date(), "MMMM d, yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={totalUsers} 
          icon={<Users className="w-5 h-5" />} 
          trend="+12%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Active Devices" 
          value={totalDevices} 
          icon={<MonitorSmartphone className="w-5 h-5" />} 
          trend="Stable" 
          trendUp={true} 
        />
        <StatsCard 
          title="Recent Grants" 
          value={grantedAccess} 
          icon={<KeyRound className="w-5 h-5" />} 
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatsCard 
          title="Recent Denials" 
          value={deniedAccess} 
          icon={<ShieldAlert className="w-5 h-5" />} 
          className={deniedAccess > 0 ? "bg-rose-50/50 border-rose-100" : ""}
          trend={deniedAccess > 0 ? "Action Required" : "All Clear"}
          trendUp={deniedAccess === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Access Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="granted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="denied" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.filter((l: any) => l.result === "DENIED").slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Access Denied</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {log.denialReason || "Unknown reason"} at {log.deviceName}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {log.accessTime ? format(new Date(log.accessTime), "PP p") : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
              {recentLogs.filter((l: any) => l.result === "DENIED").length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent security alerts.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
