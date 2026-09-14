import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes/AppRouter";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
