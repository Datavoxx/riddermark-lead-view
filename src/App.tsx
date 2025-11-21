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
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Channel from "./pages/Channel";

import ArendenList from "./pages/ArendenList";
import ArendeDetail from "./pages/ArendeDetail";
import Reports from "./pages/Reports";
import TotalLeads from "./pages/TotalLeads";
import ConversionRate from "./pages/ConversionRate";
import ResponseTime from "./pages/ResponseTime";
import ActiveLeads from "./pages/ActiveLeads";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Bilar from "./pages/Bilar";
import Agent from "./pages/Agent";
import Notiser from "./pages/Notiser";
import IVerkstad from "./pages/IVerkstad";
import Servicestatus from "./pages/Servicestatus";
import Wayke from "./pages/Wayke";
import Bytbil from "./pages/Bytbil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <EmailDraftModal />
          <BrowserRouter>
          <Routes>
            <Route path="/test" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/blocket/wayke" element={<Wayke />} />
              <Route path="/blocket/bytbil" element={<Bytbil />} />
                        <Route path="/fordonstatus/bilar" element={<Bilar />} />
                        <Route path="/fordonstatus/i-verkstad" element={<IVerkstad />} />
                        <Route path="/fordonstatus/servicestatus" element={<Servicestatus />} />
                        <Route path="/bilar" element={<Bilar />} />
                        <Route path="/agent" element={<Agent />} />
                        <Route path="/agent/:agentId" element={<Agent />} />
                        <Route path="/notiser" element={<Notiser />} />
                        <Route path="/channel/:id" element={<Channel />} />
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
