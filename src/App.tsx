import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./components/HomePage";
import ExploreFeatures from "./pages/ExploreFeatures";
import LabReportAnalysis from "./pages/LabReportAnalysis";
import HealthTracker from "./pages/HealthTracker";
import Chatbot from "./pages/Chatbot";
import Reminders from "./pages/Reminders";
import ProgressDashboard from "./pages/ProgressDashboard";
import DoctorConnect from "./pages/DoctorConnect";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExploreFeatures />} />
          <Route path="/lab-report" element={<LabReportAnalysis />} />
          <Route path="/health-tracker" element={<HealthTracker />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/progress" element={<ProgressDashboard />} />
          <Route path="/doctor-connect" element={<DoctorConnect />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
