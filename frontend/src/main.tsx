import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "stream-chat-react/dist/css/v2/index.css";
import "@/index.css";
import App from "@/App";

import { BrowserRouter } from "react-router-dom"; // Use react-router-dom for web

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Get the root element and assert its type
const container = document.getElementById("root") as HTMLElement;

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);