import { ReactNode } from "react";

export interface Car {
  make: ReactNode;
  model: ReactNode;
  vin: ReactNode;
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