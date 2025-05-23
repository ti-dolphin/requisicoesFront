import React from "react";
import "./index.css";
import { RouterProvider } from "./routes.tsx";
import { router } from "./routes.tsx";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";
import { RequisitionContextProvider } from "./Requisitions/context/RequisitionContext.tsx";
import { UserContextProvider } from "./Requisitions/context/userContext.tsx";
import { PatrimonyInfoContextProvider } from "./Patrimony/context/patrimonyInfoContext.tsx";
import { ChecklistContextProvider } from "./Patrimony/context/checklistContext.tsx";
import { OpportunityInfoProvider } from "./crm/context/OpportunityInfoContext.tsx";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  ptBR
);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <UserContextProvider>
        <RequisitionContextProvider>
          <OpportunityInfoProvider>
            <PatrimonyInfoContextProvider>
              <ChecklistContextProvider>
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                </QueryClientProvider>
              </ChecklistContextProvider>
            </PatrimonyInfoContextProvider>
          </OpportunityInfoProvider>
        </RequisitionContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
