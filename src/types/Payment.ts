export interface Payment {
    [x: string]: string | number | Date;
    id: number;
    invoiceId: number;
    amount: number;
    paymentDate: string; // ISO string
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface PaymentTableNotification {
    id: number;
    invoiceId: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface PaymentStatus {
    [x: string]: string;
    PAID: string;
    PENDING: string;
    UNPAID: string; 
  }