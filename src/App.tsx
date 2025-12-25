import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import DevicesPage from "@/pages/Devices";
// import RemoteGroupsPage from "@/pages/RemoteGroups";
// import ReportsPage from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  // const { user, isLoadingUser  } = useAuth();

  // if (isLoadingUser ) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <Loader2 className="w-8 h-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return <Redirect to="/login" />;
  // }

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
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route> */}

      {/* Redirect root to dashboard */}
      {/* <Route path="/">
        <Redirect to="/dashboard" />
      </Route> */}

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
