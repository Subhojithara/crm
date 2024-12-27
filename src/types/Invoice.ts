import { Key, ReactNode } from 'react';


export interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website: string;
  gst: string;
  upi: string;
  fssai?: string;
  pan: string;
  bankDetails: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceItem {
  id: Key | null | undefined;
  sellingPrice(sellingPrice: number): ReactNode;
  unit: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  crateId?: number;
  crateQuantity?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Car {
  make: string;
  model: string;
  vin: string;
  id?: number;
  clerkUserId: string;
  carName: string;
  carNumber: string;
  driverName: string;
  driverLicense: string;
  driverPhone: string;
  carModel?: string;
  carColor?: string;
  carType?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
  registrationNumber?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  payments: Payment[];
  driverName: string;
  vehicleNumber: string;
  id: number;
  companyId: number;
  clientId: number;
  company: Company;
  client: Customer;
  invoiceItems: InvoiceItem[];
  igst: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
  carDetails: Car;
}

export interface Totals {
  totalPrice: number;
  igstPrice: number;
  cgstPrice: number;
  sgstPrice: number;
  totalTax: number;
  netAmount: number;
}

export interface Taxes {
  igst: number;
  cgst: number;
  sgst: number;
}

export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  UNPAID = "UNPAID",
}

export enum NotificationType {
  CREATED = "CREATED",
  EDITED = "EDITED",
  DELETED = "DELETED",
}

export interface Notification {
  id: number;
  userId: string;
  invoiceId: number;
  type: NotificationType;
  message: string;
  createdAt: string;
}