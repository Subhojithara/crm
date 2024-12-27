import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ClerkProvider } from "@clerk/nextjs"
import DarkModeToggle from "@/components/DarkModeToggle"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
    <SidebarProvider>
      <AppSidebar isDialogOpen={false} />
      <div className="absolute top-4 right-4 ">
        <DarkModeToggle />
        <SidebarTrigger />
      </div>

      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
      <Toaster />
    </SidebarProvider>
  </ClerkProvider>
  )
}
