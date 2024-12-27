export interface DashboardStats {
    totalRevenue: number;
    receivedAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    activeCustomers: number;
    growthRate: number;
  }
  
  export interface ChartData {
    createdAt: string;
    revenue: number;
    orders: number;
  }
  
  export type TimeFilter = "hour" | "day" | "week" | "month" | "year";