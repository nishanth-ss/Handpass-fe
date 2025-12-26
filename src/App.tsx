import { Switch, Route, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import DevicesPage from "@/pages/Devices";
import { Layout } from "@/components/Layout";
// import RemoteGroupsPage from "@/pages/RemoteGroups";
import ReportsPage from "@/pages/Reports";
import NotFound from "@/pages/not-found";
import { useAuthContext } from "./hooks/AuthContext";
import GroupManagement from "./pages/GroupManagement";
import { NotificationProvider } from "./context/NotificationContext";
import FirmwareCheck from "./pages/FirmwareCheck";
// Create a single QueryClient instance
const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuthContext();
  const [location] = useLocation();

  if (!isAuthenticated && location !== "/login") {
    return <Redirect to="/login" />;
  }

  if (isAuthenticated && location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} />
      </Route>
      <Route path="/devices">
        <ProtectedRoute component={DevicesPage} />
      </Route>
      {/* <Route path="/remote-groups">
        <ProtectedRoute component={RemoteGroupsPage} />
      </Route> */}
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/group-management">
        <ProtectedRoute component={GroupManagement} />
      </Route>
      <Route path="/firm-check">
        <ProtectedRoute component={FirmwareCheck} />
      </Route>
      {/* Redirect root to dashboard */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TooltipProvider>
          <NotificationProvider>
            <Router />
            <Toaster />
          </NotificationProvider>
        </TooltipProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
