"use client";

import React, { useEffect, useState } from "react";
import { Invoice, PaymentStatus } from "@/types/Invoice";
import { getUnpaidInvoices } from "@/lib/invoiceService"; // You'll need to create this function
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

const UnpaidInvoices: React.FC = () => {
  const { toast } = useToast();
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);

  useEffect(() => {
    const fetchUnpaidInvoices = async () => {
      setLoading(true);
      try {
        const invoices = await getUnpaidInvoices();
        setUnpaidInvoices(invoices);
      } catch (error) {
        console.error("Failed to fetch unpaid invoices:", error);
        toast({
          title: "Error",
          description: "Failed to fetch unpaid invoices.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidInvoices();
  }, [toast]);

  const handleInvoiceSelection = (invoiceId: number) => {
    setSelectedInvoices((prevSelected) => {
      if (prevSelected.includes(invoiceId)) {
        return prevSelected.filter((id) => id !== invoiceId);
      } else {
        return [...prevSelected, invoiceId];
      }
    });
  };

  const handleSendBulkReminder = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "No invoices selected",
        description: "Please select at least one invoice to send a reminder.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call API route to send bulk email reminder
      const response = await fetch("/api/sendBulkReminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceIds: selectedInvoices }),
      });

      if (!response.ok) {
        throw new Error("Failed to send bulk reminder.");
      }

      toast({
        title: "Success",
        description: "Bulk reminder sent successfully.",
        variant: "default",
      });

      setSelectedInvoices([]); // Clear selected invoices
    } catch (error) {
      console.error("Failed to send bulk reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send bulk reminder.",
        variant: "destructive",
      });
    }
  };

  const getOverdueDays = (invoice: Invoice): number => {
    const dueDate = new Date(invoice.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Unpaid Invoices</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <Button
              onClick={handleSendBulkReminder}
              disabled={selectedInvoices.length === 0}
            >
              <Send className="mr-2" />
              Send Bulk Reminder
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Customer Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Overdue (Days)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleInvoiceSelection(invoice.id)}
                    />
                  </TableCell>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>{invoice.client.email}</TableCell>
                  <TableCell>{invoice.netAmount}</TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getOverdueDays(invoice) > 0 && (
                      <Alert variant="destructive">
                        <AlertTitle>Overdue</AlertTitle>
                        <AlertDescription>
                          {getOverdueDays(invoice)} days
                        </AlertDescription>
                      </Alert>
                    )}
                    {getOverdueDays(invoice) <= 0 && <span> - </span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.paymentStatus === PaymentStatus.UNPAID
                          ? "destructive"
                          : "default"
                      }
                    >
                      {invoice.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default UnpaidInvoices;