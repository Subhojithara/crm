"use client";

import React, { useEffect, useState } from 'react';
import { Invoice } from '@/types/Invoice';
import { Payment } from '@/types/Payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Receipt, AlertCircle, BadgeDollarSign, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InvoiceTransactionProps {
  invoice: Invoice;
  onTransactionComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const paymentMethods = ["Credit Card", "Debit Card", "Cash", "Bank Transfer", "UPI"];

const InvoiceTransaction: React.FC<InvoiceTransactionProps> = ({
  invoice,
  onTransactionComplete,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const remainingAmount = invoice.netAmount - invoice.amountPaid;
  const isFullyPaid = remainingAmount <= 0;
  const percentagePaid = ((invoice.amountPaid / invoice.netAmount) * 100).toFixed(1);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/invoiceTable?invoiceId=${invoice.id}`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data: Payment[] = await response.json();
        setPayments(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message || 'Failed to fetch payments',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchPayments();
  }, [invoice.id, isOpen, toast]);

  const handlePayment = React.useCallback(async () => {
    if (!paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentAmount > remainingAmount) {
      toast({
        title: 'Exceeds Amount',
        description: 'Payment amount exceeds the outstanding balance.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invoiceTable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          paymentAmount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment.');
      }

      const newPayment: Payment = {
        id: Date.now(),
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentDate: new Date().toISOString(),
        paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPayments([...payments, newPayment]);
      setPaymentAmount(0);
      setPaymentMethod('');

      toast({
        title: 'Payment Successful',
        description: `₹${paymentAmount.toFixed(2)} has been added to the invoice.`,
      });

      onTransactionComplete();
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: (error as Error).message || 'Failed to process payment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [invoice.id, paymentAmount, paymentMethod, onTransactionComplete]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `Invoice_${invoice.id}_Transactions.xlsx`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="space-y-2 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-6 h-6" />
            Invoice #{invoice.id}
          </SheetTitle>
          <SheetDescription className="text-sm">
            Manage payments for this invoice
          </SheetDescription>
          {/* Invoice Summary Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <BadgeDollarSign className="w-4 h-4" />
                  Total Amount
                </p>
                <p className="text-2xl font-bold">₹{invoice.netAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isFullyPaid ? "text-green-600" : "text-blue-600"
                )}>
                  ₹{remainingAmount.toFixed(2)}
                </p>
              </div>
              <div className="col-span-2 pt-2">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isFullyPaid ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(100, Number(percentagePaid))}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {percentagePaid}% paid
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Payment History
                </h3>
                {payments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exportToExcel}
                    className="hover:bg-gray-100 rounded-full"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
        </SheetHeader>

        <ScrollArea className="h-[150px] pr-4 overflow-y-auto">
          <div className="space-y-6">

            {/* Payment History */}
            <div className="space-y-3">
            
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="border border-gray-100">
                        <CardContent className="p-4 grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[80px]" />
                            <Skeleton className="h-3 w-[120px]" />
                          </div>
                          <div className="space-y-2 text-right">
                            <Skeleton className="h-4 w-[80px] ml-auto" />
                            <Skeleton className="h-3 w-[100px] ml-auto" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No payments recorded yet
                    </div>
                  ) : (
                    payments.slice().reverse().map((payment) => (
                      <Card key={payment.id} className="border border-gray-100 hover:border-gray-200 transition-colors hover:shadow-sm">
                        <CardContent className="p-4 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium">₹{payment.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <BadgeDollarSign className="w-3 h-3" />
                              {payment.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter>
          <div className="w-screen">
            {/* New Payment Section */}
            {!isFullyPaid && (
              <Card className="border-2 border-dashed hover:border-blue-200 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    New Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Record Payment'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Fully Paid Status */}
            {isFullyPaid && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Invoice fully paid</p>
              </div>
            )}
          </div>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
};

export default InvoiceTransaction;
