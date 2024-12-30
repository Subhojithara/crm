"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  fetchRecentInvoices,
  fetchRecentPayments,
  fetchUserProfile,
} from "@/lib/data-fetching";
import { Invoice, Payment } from "@/types/Invoice";
import { User as DBUser } from "@/types/User";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon, AlertCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import OverviewCardsManager from "./OverviewCardsManager";
import SalesChart from "./SalesChart";
import RecentInvoices from "./RecentInvoices";
import RecentPayments from "./RecentPayments";
import RecentActivity from "./RecentActivity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesData {
  createdAt: string;
  revenue: number;
  orders: number;
}

const Dashboard = () => {
  const { isLoaded, user } = useUser();
  const { userId } = useAuth();
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [timeFilter, setTimeFilter] = useState<
    "hour" | "day" | "month" | "year"
  >("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [totalPayments, setTotalPayments] = useState(0);
  const [activeTab, setActiveTab] = useState("sales");

  const filterSalesData = (
    data: SalesData[],
    filter: "hour" | "day" | "month" | "year",
  ) => {
    const now = new Date();
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      switch (filter) {
        case "hour":
          return (
            now.getHours() === itemDate.getHours() &&
            now.getDate() === itemDate.getDate() &&
            now.getMonth() === itemDate.getMonth() &&
            now.getFullYear() === itemDate.getFullYear()
          );
        case "day":
          return (
            now.getDate() === itemDate.getDate() &&
            now.getMonth() === itemDate.getMonth() &&
            now.getFullYear() === itemDate.getFullYear()
          );
        case "month":
          return (
            now.getMonth() === itemDate.getMonth() &&
            now.getFullYear() === itemDate.getFullYear()
          );
        case "year":
          return now.getFullYear() === itemDate.getFullYear();
        default:
          return true;
      }
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredInvoices(recentInvoices);
    } else {
      const lowerTerm = term.toLowerCase();
      const filtered = recentInvoices.filter(
        (invoice) =>
          invoice.client.name.toLowerCase().includes(lowerTerm) ||
          invoice.id.toString().includes(lowerTerm),
      );
      setFilteredInvoices(filtered);
    }
  };

  const handlePaymentSearch = (term: string) => {
    setPaymentSearchTerm(term);
    if (term.trim() === "") {
      setFilteredPayments(recentPayments);
    } else {
      const lowerTerm = term.toLowerCase();
      const filtered = recentPayments.filter(
        (payment) =>
          payment.invoiceId.toString().includes(lowerTerm) ||
          payment.amount.toString().includes(lowerTerm),
      );
      setFilteredPayments(filtered);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
          const userProfile = await fetchUserProfile(userId);
          setDbUser(userProfile);

          if (
            userProfile &&
            ["ADMIN", "MODERATOR", "MEMBER"].includes(userProfile.role)
          ) {
            const invoices = await fetchRecentInvoices(userId);
            const userPayments = await fetchRecentPayments(userId);

            setRecentInvoices(invoices);
            setFilteredInvoices(invoices);
            setRecentPayments(userPayments);
            setFilteredPayments(userPayments);

            const newTotalRevenue = invoices.reduce(
              (sum, invoice) => sum + invoice.netAmount,
              0,
            );
            setTotalRevenue(newTotalRevenue);

            const newTotalPayments = userPayments.reduce(
              (sum, payment) => sum + payment.amount,
              0,
            );
            setTotalPayments(newTotalPayments);

            const newReceivedAmount = userPayments.reduce(
              (sum, payment) => sum + payment.amount,
              0,
            );
            setReceivedAmount(newReceivedAmount);

            const newUnpaidAmount = invoices
              .filter((invoice) => invoice.paymentStatus === "UNPAID")
              .reduce((sum, invoice) => sum + invoice.netAmount, 0);
            setUnpaidAmount(newUnpaidAmount);

            const newSalesData = invoices.map((invoice) => ({
              createdAt: invoice.createdAt,
              revenue: invoice.netAmount,
              orders: 1,
            }));
            setSalesData(newSalesData);
          } else {
            setError("You do not have permission to view this dashboard.");
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unexpected error occurred.");
          }
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    setSalesData((prevSalesData) => filterSalesData(prevSalesData, timeFilter));
  }, [timeFilter]);

  if (!isLoaded || isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-700">Error</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full space-y-6"
    >
      <div className="px-6 pt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 normal-case">
              Welcome back, {dbUser?.role} {user?.firstName}!
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Notifications
          </Button>
        </div>

        <OverviewCardsManager
          totalRevenue={totalRevenue}
          receivedAmount={receivedAmount}
          unpaidAmount={unpaidAmount}
        />

        <SalesChart
          salesData={filterSalesData(salesData, timeFilter)}
          paymentData={recentPayments}
          timeFilter={timeFilter}
          setTimeFilter={(filter: "hour" | "day" | "month" | "year" | "all") =>
            setTimeFilter(filter as "hour" | "day" | "month" | "year")
          }
          totalRevenue={totalRevenue}
          totalPayments={totalPayments}
        />

        <TabsList className="grid grid-cols-4 gap-4 bg-transparent h-auto pt-8">
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            Payments
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="sales" className="p-6 space-y-6 mt-0">
        <RecentActivity invoices={recentInvoices} payments={recentPayments} />
      </TabsContent>

      <TabsContent value="invoices" className="p-6 space-y-6 mt-0">
        <div className="space-y-4">
          <Label htmlFor="invoice-search">Search Invoices</Label>
          <Input
            id="invoice-search"
            placeholder="Search by client name or invoice ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <RecentInvoices
          invoices={filteredInvoices}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
        />
      </TabsContent>

      <TabsContent value="payments" className="p-6 space-y-6 mt-0">
        <div className="space-y-4">
          <Label htmlFor="payment-search">Search Payments</Label>
          <Input
            id="payment-search"
            placeholder="Search by invoice ID or amount..."
            value={paymentSearchTerm}
            onChange={(e) => handlePaymentSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <RecentPayments
          payments={filteredPayments}
          paymentSearchTerm={paymentSearchTerm}
          handlePaymentSearch={handlePaymentSearch}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
