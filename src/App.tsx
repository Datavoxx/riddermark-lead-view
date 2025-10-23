import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { EmailDraftModal } from "@/components/EmailDraftModal";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ArendenList from "./pages/ArendenList";
import ArendeDetail from "./pages/ArendeDetail";
import Reports from "./pages/Reports";
import TotalLeads from "./pages/TotalLeads";
import ConversionRate from "./pages/ConversionRate";
import ResponseTime from "./pages/ResponseTime";
import ActiveLeads from "./pages/ActiveLeads";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BilAnnonsgenerator from "./pages/BilAnnonsgenerator";
import Agent from "./pages/Agent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <EmailDraftModal />
        <BrowserRouter>
          <Routes>
            <Route path="/test" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/reports/total-leads" element={<TotalLeads />} />
                        <Route path="/reports/conversion-rate" element={<ConversionRate />} />
                        <Route path="/reports/response-time" element={<ResponseTime />} />
                        <Route path="/reports/active-leads" element={<ActiveLeads />} />
                        <Route path="/blocket/arenden" element={<ArendenList />} />
                        <Route path="/blocket/arenden/:id" element={<ArendeDetail />} />
                        <Route path="/bil-annonsgenerator" element={<BilAnnonsgenerator />} />
                        <Route path="/agent" element={<Agent />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
