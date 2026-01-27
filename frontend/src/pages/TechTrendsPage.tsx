import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; // Removed BrowserRouter
import { AppLayout } from "../components/AppLayout"; // Adjusted path assumption
import DashboardOverview from "./DashboardOverview";
import StackExplorer from "./StackExplorer";
import CategoryAnalytics from "./CategoryAnalytics";
import StackForecast from "./StackForecast";
import StackComparison from "./StackComparison";
import NotFound from "./NotFound";

const queryClient = new QueryClient();

const TechTrendsPage = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Note: The layout and sub-routes are handled here. 
        Ensure your Main App Router points to "/tech-trends/*" to render this.
      */}
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/stacks" element={<StackExplorer />} />
          <Route path="/categories" element={<CategoryAnalytics />} />
          <Route path="/forecast" element={<StackForecast />} />
          <Route path="/compare" element={<StackComparison />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default TechTrendsPage;