import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Automations from "@/pages/Automations";
import Documents from "@/pages/Documents";
import Scraping from "@/pages/Scraping";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Layout from "./components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leads" component={Leads} />
        <Route path="/automations" component={Automations} />
        <Route path="/documents" component={Documents} />
        <Route path="/scraping" component={Scraping} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
