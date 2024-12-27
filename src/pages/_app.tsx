import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProps } from 'next/app';
import '@/app/globals.css';


function MyApp({ Component, pageProps }: AppProps) {
  console.log("Clerk Publishable Key:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY); // Temporary logging

  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp; 