import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {DevNewsPage} from "./components/devnews/DevNewsPage";
import TechTrendsPage from "./pages/TechTrendsPage";
import GitHubIntelPage from "./pages/GitHubIntelPage";

const queryClient = new QueryClient();

const App = () => {
  // This hook ensures the browser tab title stays "NeuroLearn"
  useEffect(() => {
    document.title = "NeuroLearn";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/devnews" element={<DevNewsPage />} />
            <Route path="/tech-trends/*" element={<TechTrendsPage />} />
            <Route path="/github-intel/*" element={<GitHubIntelPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;