import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { Autocomplete, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { getAllUsers as fetchAllUsers } from "../api/usersApi";
import { getReports } from "@/hooks/use-reports";
import { useDevices } from "@/hooks/use-devices";

export default function Reports() {

  const [filters, setFilters] = useState({
    sn: "",
    name: "",
    user_id: "",
    palm_type: "",
    start_date: null,
    end_date: null,
    format: "csv",
  });
  const [snList, setSnList] = useState([]);
  const [nameList, setNameList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [palmTypeList, setPalmTypeList] = useState([]);
  const { devices, isLoading, createDevice, deleteDevice, updateDevice } = useDevices();



  useEffect(() => {
    getAllUsers()
  }, []);

  const fetchReports = async (filters: any) => {
    const customPayload = {
      ...filters,
      user_id: filters.user_id || "",
      start_date: filters.start_date?.toISOString() || "",
      end_date: filters.end_date?.toISOString() || "",
      sn: filters.sn || "",
    };

    try {
      const response = await getReports(customPayload);

      if (response) {
        downloadCSV(response); // ⬅ Download CSV data
      } else {
        alert("No data found!");
      }

    } catch (error) {
      console.log(error);
    }
  };

  const downloadCSV = (csvText: any) => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // const getAllDevicesData = async () => {
  //   try {
  //     const response = await getAllDevices();
  //     setSnList(response?.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const getAllUsers = async () => {
    try {
      const response = await fetchAllUsers();
      setUserList(response?.data);
    } catch (error) {
      console.log(error);

    }
  }

  const applyFilters = () => {
    fetchReports(filters)
  }
  console.log(devices);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">System Reports</h2>
        <p className="text-muted-foreground mt-1">Detailed logs of access attempts and enrollments.</p>
      </div>

      {/* <Tabs defaultValue="access" className="w-full">
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
      </Tabs> */}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

        {/* SN Filter */}
        <Autocomplete
          options={devices}
          getOptionLabel={(option) => option.sn || ""}
          value={filters.sn}
          onChange={(e, v) => setFilters({ ...filters, sn: v })}
          renderInput={(params) => <TextField {...params} label="SN" />}
          sx={{ width: 250 }}
        />

        {/* User ID Filter */}
        <Autocomplete
          options={userList}
          getOptionLabel={(option) => option.name || ""}
          value={filters.user_id}
          onChange={(e, v) => setFilters({ ...filters, user_id: v })}
          renderInput={(params) => <TextField {...params} label="User" />}
          sx={{ width: 250 }}
        />

        {/* Palm Type Filter */}
        {/* <Autocomplete
                    options={palmTypeList}
                    value={filters.palm_type}
                    onChange={(e, v) => setFilters({ ...filters, palm_type: v })}
                    renderInput={(params) => <TextField {...params} label="Palm Type" />}
                    sx={{ width: 250 }}
                /> */}

        {/* Date Range */}
        <DatePicker
          label="Start Date"
          value={filters.start_date}
          onChange={(newDate: any) =>
            setFilters({ ...filters, start_date: newDate })
          }
        />

        <DatePicker
          label="End Date"
          value={filters.end_date}
          onChange={(newDate: any) =>
            setFilters({ ...filters, end_date: newDate })
          }
        />
      </div>

      <Button
        variant="contained"
        onClick={applyFilters}
        sx={{ marginTop: 3 }}
      >
        Download CSV
      </Button>
    </Layout>
  );
}
