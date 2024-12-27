'use client';

import React from 'react';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/auth'); // Redirect to authentication page if not signed in
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Ensure that the user data is available before rendering the greeting
  const userName = user?.firstName || 'User';

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard, {userName}!</h1>
    </div>
  );
};

const DashboardPageWithProvider = () => (
  <ClerkProvider>
    <DashboardPage />
  </ClerkProvider>
);

export default DashboardPageWithProvider;