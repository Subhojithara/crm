import { Invoice } from '@/types/Invoice'; // Adjust the import based on your project structure

// Function to fetch invoice by ID with related Customer and Company
export async function getInvoiceById(invoiceId: number): Promise<Invoice | null> {
  try {
    const response = await fetch(`/api/invoiceTable?id=${invoiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice.');
    }
    const data: Invoice = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to fetch past invoices for a customer
export async function getPastInvoices(customerId: number, excludeInvoiceId: number): Promise<Invoice[]> {
  try {
    const response = await fetch(`/api/invoiceTable?customerId=${customerId}&excludeId=${excludeInvoiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch past invoices.');
    }
    const data: Invoice[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to generate invoice PDF (as per existing code)

// Function to fetch unpaid invoices
export async function getUnpaidInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch(`/api/invoices?paymentStatus=UNPAID`); // Add query parameter
    if (!response.ok) {
      throw new Error('Failed to fetch unpaid invoices.');
    }
    const data: Invoice[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
