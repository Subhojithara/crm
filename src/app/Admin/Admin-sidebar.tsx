'use client';

import { Blocks, ChevronRight, LayoutDashboard, Settings, Users, LogOut, HelpCircle, Bell, UserRoundPlus } from "lucide-react";
import { useAuth, useUser } from '@clerk/nextjs';
import { Sidebar, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Company } from "@/types/Company";
import AddCompany from "@/components/company/Add-Company";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // Changed import statement
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  isActive: boolean;
  subMenu: { title: string; path: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; }[];
}

const adminNavItems: NavItem[] = [
  {
    title: "Admin Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    isActive: true,
    subMenu: [
      { title: "Overview", path: "/admin/dashboard/overview" },
      { title: "Statistics", path: "/admin/dashboard/statistics" },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    path: "/admin/users",
    isActive: false,
    subMenu: [
      { title: "All Users", path: "/Admin/user", icon: Users },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
    isActive: false,
    subMenu: [
      { title: "Profile Settings", path: "/admin/settings/profile" },
      { title: "System Settings", path: "/admin/settings/system" },
    ],
  },
  {
    title: "Seller",
    icon: UserRoundPlus,
    path: "/",
    isActive: false,
    subMenu: [
      { title: "Add Seller", path: "/Admin/seller/addseller", icon: UserRoundPlus },
      { title: "All Sellers", path: "/Admin/seller/allseller", icon: UserRoundPlus },
    ],
  },
];

export function AdminSidebar() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [openSubMenus, setOpenSubMenus] = useState<{ [key: number]: boolean }>({});
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isCompaniesLoading, setIsCompaniesLoading] = useState<boolean>(true);
    const [isUserDataLoading, setIsUserDataLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsCompaniesLoading(true);
            try {
                const response = await fetch('/api/company');
                if (response.ok) {
                    const data = await response.json();
                    setCompanies(data.companies);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setIsCompaniesLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (user) {
            setIsUserDataLoading(false);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleSubMenu = (index: number) => {
        setOpenSubMenus((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <Sidebar className={`flex flex-col h-full ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <SidebarHeader className="sticky top-0 z-10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    {isCompaniesLoading ? (
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    ) : (
                                        <div className="flex h-8 w-8 bg-blue-700 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                            <Blocks strokeWidth={2} color="white" className="h-4 w-4" />
                                        </div>
                                    )}
                                    {isSidebarOpen && (
                                        <div className="flex flex-1 flex-col items-start text-sm">
                                            <span>{companies.length > 0 ? companies[0].name : 'No Company'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {companies.length > 0 ? companies[0].email : 'No Email'}
                                            </span>
                                        </div>
                                    )}
                                    <ChevronRight className={`h-4 w-4 text-muted-foreground ${isSidebarOpen ? 'rotate-90' : ''}`} />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            {isSidebarOpen && (
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width]"
                                    side="right"
                                    align="start"
                                >
                                    {companies.map((company, index) => (
                                        <DropdownMenuItem key={index} onClick={() => handleNavigation(`/admin/company/${company.id}`)}>
                                            <span>{company.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <SidebarGroupContent />
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
                <AddCompany />
            </SidebarHeader>

            <ScrollArea className="h-full w-full">
            <SidebarMenu className="flex-grow pl-3 overflow-y-auto">
                {isSidebarOpen && <h1 className="font-semibold text-xs pl-2 mt-4">Admin Panel</h1>}
                {adminNavItems.map((item, index) => (
                    <div key={index}>
                        <SidebarMenuItem className={item.isActive ? 'active' : ''}>
                            <SidebarMenuButton onClick={() => toggleSubMenu(index)}>
                                <item.icon className="h-4 w-4" />
                                {isSidebarOpen && <span>{item.title}</span>}
                                {item.subMenu && <ChevronRight className={`h-4 w-4 ml-auto ${openSubMenus[index] ? 'rotate-90' : ''}`} />}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {isSidebarOpen && item.subMenu && openSubMenus[index] && (
                            <div className="pl-6">
                                {item.subMenu.map((subItem, subIndex) => (
                                    <SidebarMenuItem key={subIndex}>
                                        <SidebarMenuButton onClick={() => handleNavigation(subItem.path)}>
                                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                            <span>{subItem.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </SidebarMenu>
            </ScrollArea>

            <SidebarFooter className="sticky bottom-0 z-10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="">
                                    {isUserDataLoading ? (
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            {user?.imageUrl ? (
                                                <Image
                                                    src={user.imageUrl}
                                                    alt="User Avatar"
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <Avatar>
                                                    <AvatarImage src={user?.imageUrl} alt="User Avatar" />
                                                    <AvatarFallback>UN</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    )}
                                    {isSidebarOpen && (
                                        <div className="flex flex-col text-start text-sm text-muted-foreground mt-2">
                                            <span className="font-bold">{user?.fullName || 'No name available'}</span>
                                            <span>{user?.primaryEmailAddress?.emailAddress || 'No email available'}</span>
                                        </div>
                                    )}
                                    <ChevronRight className={`h-4 w-4 text-muted-foreground ${isSidebarOpen ? 'rotate-90' : ''}`} />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            {isSidebarOpen && (
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width]"
                                    side="right"
                                    align="start"
                                >
                                    <div className="border-b border-gray-200">
                                        <SidebarMenuButton size="lg">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                {user?.imageUrl ? (
                                                    <Image
                                                        src={user.imageUrl}
                                                        alt="User Avatar"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : (
                                                    <Avatar>
                                                        <AvatarImage src={user?.imageUrl} alt="User Avatar" />
                                                        <AvatarFallback>UN</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                            <div className="flex flex-col text-start text-sm text-muted-foreground mt-2 mb-2">
                                                <span className="font-bold">{user?.fullName || 'No name available'}</span>
                                                <span>{user?.primaryEmailAddress?.emailAddress || 'No email available'}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </div>
                                    <DropdownMenuItem>
                                        <Bell className="h-4 w-4" />
                                        <span>Notifications</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <HelpCircle className="h-4 w-4" />
                                        <span>Help</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="logout-button h-4 w-4 cursor-pointer" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
