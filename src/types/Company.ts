export interface Company {
  id?: number; // Changed from string to number
  clerkUserId?: string;
  userId?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gst: string;
  upi?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  extraDetails?: string;
  fssai?: string;
  logoUrl?: string; // URL to the uploaded logo
  createdAt?: Date;
  updatedAt?: Date;
} 