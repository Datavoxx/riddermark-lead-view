import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { EmailDraftModal } from "@/components/EmailDraftModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
import Inkorg from "./pages/Inkorg";
import InkorgDetail from "./pages/InkorgDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleMapsProvider>
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
                    <main className="flex-1 pb-20 md:pb-0">
                      <Routes>
                        <Route path="/" element={<RoleProtectedRoute><Dashboard /></RoleProtectedRoute>} />
                        <Route path="/dashboard" element={<RoleProtectedRoute><Dashboard /></RoleProtectedRoute>} />
                        <Route path="/reports" element={<RoleProtectedRoute><Reports /></RoleProtectedRoute>} />
                        <Route path="/reports/total-leads" element={<RoleProtectedRoute><TotalLeads /></RoleProtectedRoute>} />
                        <Route path="/reports/conversion-rate" element={<RoleProtectedRoute><ConversionRate /></RoleProtectedRoute>} />
                        <Route path="/reports/response-time" element={<RoleProtectedRoute><ResponseTime /></RoleProtectedRoute>} />
                        <Route path="/reports/active-leads" element={<RoleProtectedRoute><ActiveLeads /></RoleProtectedRoute>} />
              <Route path="/blocket/arenden" element={<RoleProtectedRoute allowedForBlocketOnly><ArendenList /></RoleProtectedRoute>} />
              <Route path="/blocket/arenden/:id" element={<RoleProtectedRoute allowedForBlocketOnly><ArendeDetail /></RoleProtectedRoute>} />
              <Route path="/blocket/wayke" element={<RoleProtectedRoute><Wayke /></RoleProtectedRoute>} />
              <Route path="/blocket/bytbil" element={<RoleProtectedRoute><Bytbil /></RoleProtectedRoute>} />
                        <Route path="/fordonstatus/bilar" element={<RoleProtectedRoute><Bilar /></RoleProtectedRoute>} />
                        <Route path="/fordonstatus/verkstad" element={<RoleProtectedRoute><IVerkstad /></RoleProtectedRoute>} />
                        <Route path="/fordonstatus/servicestatus" element={<RoleProtectedRoute><Servicestatus /></RoleProtectedRoute>} />
                        <Route path="/fordonstatus/agent" element={<RoleProtectedRoute><Agent /></RoleProtectedRoute>} />
                        <Route path="/fordonstatus/agent/:agentId" element={<RoleProtectedRoute><Agent /></RoleProtectedRoute>} />
                        <Route path="/bilar" element={<RoleProtectedRoute><Bilar /></RoleProtectedRoute>} />
                        <Route path="/agent" element={<RoleProtectedRoute><Agent /></RoleProtectedRoute>} />
                        <Route path="/agent/:agentId" element={<RoleProtectedRoute><Agent /></RoleProtectedRoute>} />
                        <Route path="/notiser" element={<RoleProtectedRoute><Notiser /></RoleProtectedRoute>} />
                        <Route path="/inkorg" element={<RoleProtectedRoute><Inkorg /></RoleProtectedRoute>} />
                        <Route path="/inkorg/:id" element={<RoleProtectedRoute><InkorgDetail /></RoleProtectedRoute>} />
                        <Route path="/channel/:id" element={<RoleProtectedRoute><Channel /></RoleProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <MobileBottomNav />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </GoogleMapsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
