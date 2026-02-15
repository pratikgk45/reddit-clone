'use client';

import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import client from '@/lib/apollo-client';
import { ComponentProps } from 'react';
import { Header } from '@/Components/Header';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/Components/ErrorBoundary';

export default function RootProvider({ children, pageProps }: ComponentProps<any>) {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <SessionProvider session={pageProps?.session}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <div className="h-screen overflow-y-scroll bg-slate-200">
            <Header />

            {children}
          </div>
        </SessionProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
