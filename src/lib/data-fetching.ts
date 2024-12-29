// src/lib/data-fetching.ts

import { Invoice, Payment } from '@/types/Invoice';
import { User } from '@/types/User';
import { ProductPurchase, ProductSelling } from '@/types/Product';
import { ChartData } from '@/types/Dashboard';

// Placeholder for fetching recent invoices
export const fetchRecentInvoices = async (userId: string): Promise<Invoice[]> => {
  const response = await fetch(`/api/invoices?userId=${userId}&limit=10`); // Example API call
  if (!response.ok) {
    throw new Error('Failed to fetch recent invoices');
  }
  const data = await response.json();
  return data;
};

// Placeholder for fetching recent payments
export const fetchRecentPayments = async (userId: string): Promise<Payment[]> => {
  const response = await fetch(`/api/payments?userId=${userId}&limit=5`); // Call the API route
  if (!response.ok) {
    throw new Error('Failed to fetch recent payments');
  }
  const data = await response.json();
  return data;
};

// Placeholder for fetching sales data for charts
export const fetchSalesData = async (): Promise<ChartData[]> => {
  const response = await fetch('/api/sales/trend'); // Example API call
  if (!response.ok) {
    throw new Error('Failed to fetch sales data');
  }
  const data: ChartData[] = await response.json();
  return data;
};

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const response = await fetch(`/api/users/profile?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data.profile; // Assuming your API returns { profile: { ...user data } }
  };

// Fetch all product purchases
export const fetchProductPurchases = async (): Promise<ProductPurchase[]> => {
  const response = await fetch('/api/product-purchase');
  if (!response.ok) {
    throw new Error('Failed to fetch product purchases');
  }
  const data = await response.json();
  return data;
};

// Fetch all product sellings
export const fetchProductSellings = async (): Promise<ProductSelling[]> => {
  const response = await fetch('/api/product-selling');
  if (!response.ok) {
    throw new Error('Failed to fetch product sellings');
  }
  const data = await response.json();
  return data;
};