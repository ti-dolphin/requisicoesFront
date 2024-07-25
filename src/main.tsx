import React from 'react';
import './index.css';
import { RouterProvider } from './routes.tsx';
import { router } from './routes.tsx'
import ReactDOM from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
import { RequisitionContextProvider  } from './context/RequisitionContext.tsx';
import { UserContextProvider } from './context/userContext.tsx';

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  ptBR,
);

const queryClient = new QueryClient();



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <UserContextProvider>
        <RequisitionContextProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </RequisitionContextProvider> 
      </UserContextProvider>
     

    </ThemeProvider>

    
  </React.StrictMode>,
);
