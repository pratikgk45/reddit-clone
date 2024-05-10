'use client';

import { ApolloProvider } from "@apollo/client";
import { SessionProvider } from "next-auth/react";
import client from "../../apollo-client";
import { ComponentProps } from "react";
import { Header } from "@/Components/Header";
import { Toaster } from "react-hot-toast";

export default function ParentProvider({
    children,
    pageProps
  }: ComponentProps<any>) {

    return (
        <ApolloProvider client={client}>
            <SessionProvider session={pageProps?.session}>
                <Toaster />
                <div className="h-screen overflow-y-scroll bg-slate-200">
                    <Header />

                    {children}
                </div>
            </SessionProvider>
        </ApolloProvider>
    );
  }