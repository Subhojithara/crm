"use client";

import {
  Blocks,
  ChevronsLeftRight,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Users,
  Car,
  ReceiptText,
  ShoppingCart,
  ChevronRight,
  PackagePlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ClerkProvider } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company } from "@/types/Company";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  icon: LucideIcon;
  path: string;
  isActive: boolean;
  subMenu: { title: string; path: string }[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    isActive: true,
    subMenu: [
      { title: "Overview", path: "/dashboard/overview" },
      { title: "Analytics", path: "/dashboard/analytics" },
      { title: "History", path: "/dashboard/history" },
    ],
  },
  {
    title: "Customer",
    icon: Users,
    path: "/customer",
    isActive: false,
    subMenu: [
      { title: "Add New", path: "/dashboard/customer/add" },
      { title: "Manage Customer", path: "/dashboard/customer/list" },
    ],
  },
  {
    title: "Car",
    icon: Car,
    path: "/dashboard/car",
    isActive: false,
    subMenu: [
      { title: "Add New", path: "/dashboard/car/add" },
      { title: "Manage Car", path: "/dashboard/car/list" },
    ],
  },
  {
    title: "Crate",
    icon: PackagePlus,
    path: "/dashboard/crate",
    isActive: false,
    subMenu: [
      { title: "Add Crate", path: "/dashboard/crate/add" },
      { title: "Manage Crate", path: "/dashboard/invoice/list" },
    ],
  },
  {
    title: "Invoice",
    icon: ReceiptText,
    path: "/dashboard/invoice",
    isActive: false,
    subMenu: [
      { title: "Add Invoice", path: "/dashboard/invoice/add" },
      { title: "Manage Invoices", path: "/dashboard/invoice/all" },
    ],
  },
  {
    title: "Product",
    icon: ShoppingCart,
    path: "/product-Selling",
    isActive: false,
    subMenu: [
      { title: "Add Product Selling", path: "/dashboard/product-Selling/add" },
      {
        title: "Aad Products Purchase",
        path: "/dashboard/product-Purchase/add",
      },
      { title: "Manage Stock", path: "/product/manage-stock" },
      { title: "Catalog", path: "/product/catalog" },
    ],
  },
  {
    title: "Documentation",
    icon: ReceiptText,
    path: "/documentation",
    isActive: false,
    subMenu: [
      { title: "API Docs", path: "/documentation/api" },
      { title: "User Guide", path: "/documentation/user-guide" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    isActive: false,
    subMenu: [
      { title: "Profile", path: "/settings/profile" },
      { title: "Account", path: "/settings/account" },
    ],
  },
];

interface FooterMenuItemProps {
  icon: LucideIcon;
  title: string;
  path: string;
}

const FooterMenuItem: React.FC<FooterMenuItemProps> = ({
  icon: Icon,
  title,
  path,
}) => {
  const { push } = useRouter();

  const handleNavigation = (path: string) => {
    push(path);
  };

  return (
    <DropdownMenuItem onClick={() => handleNavigation(path)}>
      <Icon className="h-4 w-4 mr-2" />
      <span>{title}</span>
    </DropdownMenuItem>
  );
};

interface SidebarContentProps {
  isDialogOpen: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
  isSidebarOpen?: boolean;
}

export function AppSidebar({ isDialogOpen }: { isDialogOpen: boolean }) {
  return (
    <ClerkProvider>
      <SidebarContent isDialogOpen={isDialogOpen} />
    </ClerkProvider>
  );
}

function SidebarContent({ isDialogOpen }: SidebarContentProps) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { push } = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/company");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies);
          if (data.companies.length > 0) {
            setSelectedCompany(data.companies[0]);
          }
        } else {
          console.error(
            "Failed to fetch companies:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

    const companyName = useMemo(() => {
        return selectedCompany?.name || "No Company";
    }, [selectedCompany]);

    const companyEmail = useMemo(() => {
        return selectedCompany?.email || "No Email";
    }, [selectedCompany]);


  const handleLogout = async () => {
    try {
      await signOut();
      push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSubMenu = (index: number) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNavigation = (path: string) => {
    push(path);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  return (
    <Sidebar
      className={`flex flex-col h-full bg-white dark:bg-gray-900 shadow-lg ${
        isSidebarOpen ? "w-64" : "w-20"
      } transition-all duration-300`}
      inert={isDialogOpen ? true : undefined}
    >
      <SidebarHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <div className="flex h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-800 items-center justify-center rounded-md text-white shadow-md">
                    <Blocks strokeWidth={2} className="h-4 w-4" />
                  </div>
                  {isSidebarOpen && (
                    <div className="flex flex-1 flex-col items-start text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {companyName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {companyEmail}
                      </span>
                    </div>
                  )}
                  <ChevronsLeftRight
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isSidebarOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {isSidebarOpen && (
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-800"
                  side="right"
                  align="start"
                >
                  {companies.map((company) => (
                    <DropdownMenuItem
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700">
                        <Blocks className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-gray-900 dark:text-white ml-3">
                        {company.name}
                      </span>
                      {selectedCompany?.id === company.id && (
                        <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarMenu className="p-4">
          {isSidebarOpen && (
            <h1 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Platform
            </h1>
          )}
          {mainNavItems.map((item, index) => (
            <div key={index} className="mb-1">
              <SidebarMenuItem
                className={`rounded-lg transition-colors duration-200 ${
                  item.isActive
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <SidebarMenuButton
                  onClick={() => toggleSubMenu(index)}
                  className="w-full"
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      item.isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </span>
                  )}
                  {item.subMenu && (
                    <ChevronRight
                      className={`h-4 w-4 ml-auto text-gray-400 transition-transform duration-200 ${
                        openSubMenus[index] ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isSidebarOpen && item.subMenu && openSubMenus[index] && (
                <div className="pl-4 mt-1 space-y-1">
                  {item.subMenu.map((subItem, subIndex) => (
                    <SidebarMenuItem key={subIndex} className="rounded-lg">
                      <SidebarMenuButton
                        onClick={() => handleNavigation(subItem.path)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 w-full rounded-lg"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {subItem.title}
                        </span>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <Avatar>
                        <AvatarImage src={user?.imageUrl} alt="User Avatar" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex flex-col text-start text-sm text-muted-foreground mt-2">
                      <span className="font-bold">
                        {user?.fullName || "No name available"}
                      </span>
                      <span>
                        {user?.primaryEmailAddress?.emailAddress ||
                          "No email available"}
                      </span>
                    </div>
                  )}
                  <ChevronsLeftRight
                    className={`h-4 w-4 text-muted-foreground ${
                      isSidebarOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {isSidebarOpen && (
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width]"
                  side="right"
                  align="start"
                >
                  <div className="border-b border-gray-200 p-2">
                    <SidebarMenuButton size="lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {user?.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt="User Avatar"
                            className="h-8 w-8 rounded-full"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <Avatar>
                            <AvatarImage src={user?.imageUrl} alt="User Avatar" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex flex-col text-start text-sm text-muted-foreground ml-2">
                        <span className="font-bold">
                          {user?.fullName || "No name available"}
                        </span>
                        <span>
                          {user?.primaryEmailAddress?.emailAddress ||
                            "No email available"}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </div>
                  <FooterMenuItem
                    icon={Bell}
                    title="Notifications"
                    path="/Admin/notifications"
                  />
                  <FooterMenuItem
                    icon={User}
                    title="Account"
                    path="dashboard/userdetails"
                  />
                  <FooterMenuItem
                    icon={HelpCircle}
                    title="Help"
                    path="dashboard/help"
                  />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="logout-button h-4 w-4 mr-2 cursor-pointer" />
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
