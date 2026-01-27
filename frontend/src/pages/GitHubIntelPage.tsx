import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// Assuming these pages are in the same 'pages' directory as this file
import Dashboard from "./Dashboard";
import TrendingRepos from "./TrendingRepos";
import Technologies from "./Technologies";
import TechRadarPage from "./TechRadarPage";
import Categories from "./Categories";
import RepositoryDetail from "./RepositoryDetail";
import Sentiment from "./Sentiment";
import Competitors from "./Competitors";
import AITools from "./AITools";
import Ingestion from "./Ingestion";
import SystemHealth from "./SystemHealth";
import NotFound from "./NotFound";

const queryClient = new QueryClient();

const GitHubIntelPage = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* We use a relative path here. 
        In your Main App.tsx, ensure you define: <Route path="/github-intel/*" element={<GitHubIntelPage />} />
      */}
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="trending" element={<TrendingRepos />} />
          <Route path="technologies" element={<Technologies />} />
          <Route path="tech-radar" element={<TechRadarPage />} />
          <Route path="categories" element={<Categories />} />
          <Route path="repository" element={<RepositoryDetail />} />
          <Route path="sentiment" element={<Sentiment />} />
          <Route path="competitors" element={<Competitors />} />
          <Route path="ai-tools" element={<AITools />} />
          <Route path="ingestion" element={<Ingestion />} />
          <Route path="system" element={<SystemHealth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default GitHubIntelPage;