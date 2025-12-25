import { Layout } from "@/components/Layout";
import { useReports } from "@/hooks/use-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const { accessLogs, enrollments, isLoading } = useReports();

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">System Reports</h2>
        <p className="text-muted-foreground mt-1">Detailed logs of access attempts and enrollments.</p>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="mt-0">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : accessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {log.accessTime ? format(new Date(log.accessTime), "PP pp") : "-"}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName || "Unknown"}</TableCell>
                    <TableCell>{log.deviceName || "Unknown Device"}</TableCell>
                    <TableCell>
                      <Badge variant={log.result === "GRANTED" ? "default" : "destructive"}>
                        {log.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.denialReason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-0">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled At</TableHead>
                  <TableHead>Device used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : enrollments.map((enr) => (
                  <TableRow key={enr.id}>
                    <TableCell className="font-medium">{enr.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={enr.status === "ENROLLED" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                        {enr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {enr.enrolledAt ? format(new Date(enr.enrolledAt), "PP") : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {enr.deviceName || "Direct Upload"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
