'use client';

import { Header } from "@/Components/Header";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

export default function Home({ pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps?.session}>
      <Header></Header>
    </SessionProvider>
  );
}
 