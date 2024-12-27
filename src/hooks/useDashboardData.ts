import { useState, useEffect, useCallback } from "react";
import { ChartData, TimeFilter } from "@/types/Dashboard";
import { Invoice, Payment } from "@/types/Invoice";
import { User } from "@/types/User";
import {
  fetchRecentInvoices,
  fetchRecentPayments,
  fetchUserProfile,
} from "@/lib/data-fetching";
import { calculateStats, filterByTime } from "@/utils/dashboard";

interface DashboardData {
  recentInvoices: Invoice[];
  filteredInvoices: Invoice[];
  recentPayments: Payment[];
  filteredPayments: Payment[];
  dbUser: User | null;
  salesData: ChartData[];
  stats: {
    totalRevenue: number;
    receivedAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    activeCustomers: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useDashboardData = (userId: string | null, initialTimeFilter: TimeFilter = "month") => {
  const [data, setData] = useState<DashboardData>({
    recentInvoices: [],
    filteredInvoices: [],
    recentPayments: [],
    filteredPayments: [],
    dbUser: null,
    salesData: [],
    stats: {
      totalRevenue: 0,
      receivedAmount: 0,
      unpaidAmount: 0,
      pendingAmount: 0,
      activeCustomers: 0,
    },
    isLoading: true,
    error: null,
  });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [userProfile, invoices, payments] = await Promise.all([
        fetchUserProfile(userId),
        fetchRecentInvoices(userId),
        fetchRecentPayments(userId),
      ]);

      const sales: ChartData[] = invoices.map((invoice) => ({
        createdAt: invoice.createdAt,
        revenue: invoice.netAmount,
        orders: 1,
      }));

      const filteredSalesData = filterByTime(sales, timeFilter);
      const stats = calculateStats(invoices);

      setData({
        recentInvoices: invoices,
        filteredInvoices: invoices,
        recentPayments: payments,
        filteredPayments: payments,
        dbUser: userProfile,
        salesData: filteredSalesData,
        stats,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [userId, timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilteredInvoices = useCallback((invoices: Invoice[]) => {
    setData((prev) => ({ ...prev, filteredInvoices: invoices }));
  }, []);

  const setFilteredPayments = useCallback((payments: Payment[]) => {
    setData((prev) => ({ ...prev, filteredPayments: payments }));
  }, []);

  return {
    ...data,
    timeFilter,
    setTimeFilter,
    setFilteredInvoices,
    setFilteredPayments,
    refreshData: fetchData,
  };
};