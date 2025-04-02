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
import AuthPage from "@/pages/auth-page";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Auth page (public) */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes (requires authentication) */}
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      <ProtectedRoute path="/dashboard" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      <ProtectedRoute path="/leads" component={() => (
        <Layout>
          <Leads />
        </Layout>
      )} />
      <ProtectedRoute path="/automations" component={() => (
        <Layout>
          <Automations />
        </Layout>
      )} />
      <ProtectedRoute path="/documents" component={() => (
        <Layout>
          <Documents />
        </Layout>
      )} />
      <ProtectedRoute path="/scraping" component={() => (
        <Layout>
          <Scraping />
        </Layout>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      <ProtectedRoute path="/help" component={() => (
        <Layout>
          <Help />
        </Layout>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
