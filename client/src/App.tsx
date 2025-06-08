import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Threats from "@/pages/threats";
import FileAnalysis from "@/pages/file-analysis";
import Configuration from "@/pages/configuration";
import Monitoring from "@/pages/monitoring";
import Logs from "@/pages/logs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/threats" component={Threats} />
          <Route path="/file-analysis" component={FileAnalysis} />
          <Route path="/configuration" component={Configuration} />
          <Route path="/monitoring" component={Monitoring} />
          <Route path="/logs" component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
