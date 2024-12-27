"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useMemo, useState } from "react";
import { Payment } from "@/types/Invoice";

interface SalesData {
  createdAt: string;
  revenue: number;
}

interface SalesChartProps {
  salesData: SalesData[];
  paymentData: Payment[];
  timeFilter: "hour" | "day" | "month" | "year" | "all";
  setTimeFilter: (filter: "hour" | "day" | "month" | "year" | "all") => void;
  totalRevenue: number;
  totalPayments: number;
}

const SalesChart: React.FC<SalesChartProps> = ({
  salesData,
  paymentData,
  timeFilter,
  setTimeFilter,
  totalRevenue,
  totalPayments,
}) => {
  const [activeChart, setActiveChart] = useState<"revenue" | "payments">(
    "revenue"
  );

  const chartConfig = {
    views: {
      label: "Sales Overview",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    payments: {
      label: "Payments",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  // Prepare and filter payment data for the chart
  const formattedPaymentData = useMemo(() => {
    if (timeFilter === "all") {
      return paymentData.map(payment => ({
        createdAt: payment.paymentDate,
        payments: payment.amount,
      }));
    }

    const now = new Date();
    return paymentData.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      switch (timeFilter) {
        case "hour":
          return now.getHours() === paymentDate.getHours() &&
            now.getDate() === paymentDate.getDate() &&
            now.getMonth() === paymentDate.getMonth() &&
            now.getFullYear() === paymentDate.getFullYear();
        case "day":
          return now.getDate() === paymentDate.getDate() &&
            now.getMonth() === paymentDate.getMonth() &&
            now.getFullYear() === paymentDate.getFullYear();
        case "month":
          return now.getMonth() === paymentDate.getMonth() &&
            now.getFullYear() === paymentDate.getFullYear();
        case "year":
          return now.getFullYear() === paymentDate.getFullYear();
        default:
          return true;
      }
    }).map(payment => ({
      createdAt: payment.paymentDate,
      payments: payment.amount,
    }));
  }, [paymentData, timeFilter]);

  // Prepare and filter sales data for the chart
  const formattedSalesData = useMemo(() => {
    if (timeFilter === "all") {
      return salesData.map(sale => ({
        createdAt: sale.createdAt,
        revenue: sale.revenue,
      }));
    }

    const now = new Date();
    return salesData.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      switch (timeFilter) {
        case "hour":
          return now.getHours() === saleDate.getHours() &&
            now.getDate() === saleDate.getDate() &&
            now.getMonth() === saleDate.getMonth() &&
            now.getFullYear() === saleDate.getFullYear();
        case "day":
          return now.getDate() === saleDate.getDate() &&
            now.getMonth() === saleDate.getMonth() &&
            now.getFullYear() === saleDate.getFullYear();
        case "month":
          return now.getMonth() === saleDate.getMonth() &&
            now.getFullYear() === saleDate.getFullYear();
        case "year":
          return now.getFullYear() === saleDate.getFullYear();
        default:
          return true;
      }
    }).map(sale => ({
      createdAt: sale.createdAt,
      revenue: sale.revenue,
    }));
  }, [salesData, timeFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Monthly revenue and payments trend
          </CardDescription>
        </div>
        <div className="flex items-center px-6">
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as "hour" | "day" | "month" | "year" | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          {["revenue", "payments"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart as "revenue" | "payments")}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {chart === "revenue"
                    ? `₹${totalRevenue.toLocaleString()}`
                    : `₹${totalPayments.toLocaleString()}`}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <LineChart data={activeChart === "revenue" ? formattedSalesData : formattedPaymentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" tickFormatter={(tick) => {
              const date = new Date(tick);
              if (timeFilter === 'hour') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (timeFilter === 'day') {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              } else if (timeFilter === 'month') {
                return date.toLocaleDateString([], { month: 'short' });
              } else if (timeFilter === 'year') {
                return date.toLocaleDateString([], { year: 'numeric' });
              } else {
                return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
              }
            }} />
            <YAxis />
            <Tooltip
              content={
                <ChartTooltipContent className="w-[150px]" nameKey="createdAt" />
              }
            />
            <Line
              type="monotone"
              dataKey={activeChart === "revenue" ? "revenue" : "payments"}
              stroke={
                activeChart === "revenue"
                  ? chartConfig.revenue.color
                  : chartConfig.payments.color
              }
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;