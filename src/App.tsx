import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { env } from "@/lib/env";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./App.css";

const queryClient = new QueryClient();

const RouteAnalytics = () => {
  const location = useLocation();

  if (!env.analyticsEnabled) {
    return null;
  }

  const path = `${location.pathname}${location.search}${location.hash}`;

  return <Analytics route={location.pathname} path={path} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteAnalytics />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/worldcup/*" element={<Index />} />
            <Route path="/historical/*" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
