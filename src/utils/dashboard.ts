import { Invoice } from "@/types/Invoice";
import { TimeFilter } from "@/types/Dashboard";

export const calculateStats = (invoices: Invoice[]) => {
  const revenue = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const pending = invoices.filter((inv) => inv.paymentStatus === "PENDING");
  const unpaid = invoices.filter((inv) => inv.paymentStatus === "UNPAID");
  const customers = new Set(invoices.map((inv) => inv.clientId)).size;
  const received = revenue - unpaid.reduce((sum, inv) => sum + inv.netAmount, 0);

  return {
    totalRevenue: revenue,
    receivedAmount: received,
    unpaidAmount: unpaid.reduce((sum, inv) => sum + inv.netAmount, 0),
    pendingAmount: pending.reduce((sum, inv) => sum + inv.netAmount, 0),
    activeCustomers: customers,
  };
};

export const filterByTime = <T extends { createdAt: string }>(data: T[], timeFilter: TimeFilter) => {
  const now = new Date();
  return data.filter((item) => {
    const itemDate = new Date(item.createdAt);
    switch (timeFilter) {
      case "hour":
        return now.getTime() - itemDate.getTime() <= 3600000;
      case "day":
        return now.getTime() - itemDate.getTime() <= 86400000;
      case "week":
        return now.getTime() - itemDate.getTime() <= 604800000;
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

export const exportToCSV = <T extends Record<string, unknown>>(data: T[], headers: string[], filename: string) => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(",")]
      .concat(data.map((row) =>
        headers
          .map((header) => {
            const keys = header.split(".");
            let value: unknown = row;
            for (const key of keys) {
              if (value && typeof value === "object" && key in value) {
                value = (value as Record<string, unknown>)[key];
              } else {
                value = ""; // Handle cases where the path does not exist
                break;
              }
            }
            return typeof value === "string" ? `"${value}"` : value;
          })
          .join(",")
      ))
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};