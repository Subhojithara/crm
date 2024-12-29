export interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    paymentDate: string; // ISO string
    paymentMethod: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    userId: string; // Add userId to match the Payment model
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