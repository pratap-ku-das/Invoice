import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { queryClient } from './lib/query';
import { useAuth } from './store/auth';
import { useTheme } from './store/theme';
import '@fontsource-variable/inter';
import './index.css';

useAuth.getState().hydrate();
useTheme.getState().init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            '!bg-white !text-slate-800 !rounded-xl !shadow-soft !border !border-slate-200/80 dark:!bg-slate-900 dark:!text-slate-100 dark:!border-slate-700',
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
