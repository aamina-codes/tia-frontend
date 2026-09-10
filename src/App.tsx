import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import CarePlan from "./pages/CarePlan";
import SettingsPage from "./pages/Settings";
import Help from "./pages/Help";
import ExploreFeatures from "./pages/ExploreFeatures";
import LabReportAnalysis from "./pages/LabReportAnalysis";
import HealthTracker from "./pages/HealthTracker";
import Chatbot from "./pages/Chatbot";
import Reminders from "./pages/Reminders";
import ProgressDashboard from "./pages/ProgressDashboard";
import DoctorConnect from "./pages/DoctorConnect";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import Profile from "./pages/Profile";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ProtectedRoute><ExploreFeatures /></ProtectedRoute>} />
          <Route path="/lab-report" element={<ProtectedRoute><LabReportAnalysis /></ProtectedRoute>} />
          <Route path="/health-tracker" element={<ProtectedRoute><HealthTracker /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
          <Route path="/doctor-connect" element={<ProtectedRoute><DoctorConnect /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
