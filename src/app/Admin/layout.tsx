"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { ClerkProvider } from "@clerk/nextjs";
import { AdminSidebar } from "./Admin-sidebar";
import Notification from "@/components/Notification/notification";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(
    "Clerk Publishable Key:",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ); // Temporary logging

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <ClerkProvider>
          <SidebarProvider>
            <AdminSidebar />
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <DarkModeToggle />
              <SidebarTrigger />
              <Notification />
            </div>
            <main className="flex-1 p-4 overflow-auto">{children}</main>
            <Toaster />
          </SidebarProvider>
        </ClerkProvider>
      )}
    </>
  );
}