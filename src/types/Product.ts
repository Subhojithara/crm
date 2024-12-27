export type ProductPurchase = {
  id: string;
  clerkUserId?: string;
  userId?: string;
  companyId: string;
  sellerId: string;
  productName: string;
  productQuantity: number;
  purchaseAmount: number;
  createdAt: string;
  status: string;
  updatedAt: string;
  isDeleted?: boolean;
  isActive?: boolean;
  received?: number;
  leaf?: number;
  rej?: number;
  shortage?: number;
  kantaWeight?: number;
  truckNumber?: string;
  chNo?: string;
  fare?: number;
  remarks?: string;
};

export type ProductSelling = {
  id: number;
  productPurchaseId: number;
  productName: string;
  sellingPrice: number;
  unit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export enum EditStatus {
  NOT_EDITED = "NOT_EDITED",
  EDITED = "EDITED",
}

export enum DeductStatus {
  NOT_DEDUCTED = "NOT_DEDUCTED",
  DEDUCTED = "DEDUCTED",
}

export interface Product {
  id: string;
  name: string;
  price: number;
  // ... other properties of your Product type
  createdAt: Date;
  updatedAt: Date;
}