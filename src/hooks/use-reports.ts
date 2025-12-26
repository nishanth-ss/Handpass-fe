// hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api"; // your Axios instance

// Example types for reports (adjust based on your backend response)
export type AccessLog = {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
};

export type Attendance = {
  id: string;
  userId: string;
  date: string;
  status: string;
};

export function useReports() {
  // --- Access Logs ---
  const accessLogsQuery = useQuery<AccessLog[]>({
    queryKey: ["/api/reports/access-logs"],
    queryFn: async () => {
      const { data } = await api.get("/api/reports/access-logs");
      return data as AccessLog[];
    },
  });

  // --- Enrollments ---
  const enrollmentsQuery = useQuery<Enrollment[]>({
    queryKey: ["/api/reports/enrollments"],
    queryFn: async () => {
      const { data } = await api.get("/api/reports/enrollments");
      return data as Enrollment[];
    },
  });

  // --- Attendance ---
  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["/api/reports/attendance"],
    queryFn: async () => {
      const { data } = await api.get("/api/reports/attendance");
      return data as Attendance[];
    },
  });

  return {
    accessLogs: accessLogsQuery.data ?? [],
    enrollments: enrollmentsQuery.data ?? [],
    attendance: attendanceQuery.data ?? [],
    isLoading:
      accessLogsQuery.isLoading ||
      enrollmentsQuery.isLoading ||
      attendanceQuery.isLoading,
  };
}

export const getReports = (payload: any) => {
  return api.post('/api/report/access-list',payload); // API path: /v1/device/getAll
};