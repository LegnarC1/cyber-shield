import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Threats from "@/pages/threats";
import FileAnalysis from "@/pages/file-analysis";
import Configuration from "@/pages/configuration";
import Monitoring from "@/pages/monitoring";
import Logs from "@/pages/logs";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardLayout} />
      <ProtectedRoute path="/threats" component={ThreatsLayout} />
      <ProtectedRoute path="/file-analysis" component={FileAnalysisLayout} />
      <ProtectedRoute path="/configuration" component={ConfigurationLayout} />
      <ProtectedRoute path="/monitoring" component={MonitoringLayout} />
      <ProtectedRoute path="/logs" component={LogsLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
}

function ThreatsLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Threats />
      </main>
    </div>
  );
}

function FileAnalysisLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <FileAnalysis />
      </main>
    </div>
  );
}

function ConfigurationLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Configuration />
      </main>
    </div>
  );
}

function MonitoringLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Monitoring />
      </main>
    </div>
  );
}

function LogsLayout() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Logs />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
