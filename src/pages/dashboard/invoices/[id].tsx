import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { CopyIcon, ChevronLeftIcon, PrinterIcon, ShareIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceById } from '@/lib/invoiceService';
import { Invoice, PaymentStatus } from '@/types/Invoice';
import PastInvoices from './PastInvoices';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import InvoiceDownloadAndPreview from '@/components/invoice/InvoiceDownloadAndPreview';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

const InvoiceDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getInvoiceById(Number(id));
        if (data) {
          setInvoice(data);
        } else {
          throw new Error("Invoice data is incomplete.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, toast]);



  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!invoice) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice #${invoice.id}`,
          text: `Invoice details for #${invoice.id}`,
          url: window.location.href,
        });
      } else {
        toast({
          title: 'Not Supported',
          description: 'Web Share API is not supported in this browser.',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold">Invoice Not Found</h2>
            <p className="text-muted-foreground">The requested invoice could not be found.</p>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/invoices')}
              className="mt-4"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.UNPAID:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6" ref={contentRef}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Invoice #{invoice?.id}</h1>
              <p className="text-muted-foreground">
                Created on{" "}
                {invoice?.createdAt &&
                  new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {invoice?.paymentStatus && (
              <Badge className={getStatusColor(invoice.paymentStatus)}>
                {invoice.paymentStatus}
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() =>
                navigator.clipboard.writeText(invoice?.id.toString())
              }
            >
              <CopyIcon className="w-4 h-4 mr-2" />
              Copy ID
            </Button>
            <InvoiceDownloadAndPreview invoice={invoice} />
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Crate</TableHead>
                      <TableHead className="text-right">Crate Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice?.invoiceItems &&
                      invoice.invoiceItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.unitPrice))}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.crateId ? item.crateId : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.crateQuantity || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.totalPrice))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {invoice && formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    Tax
                  </span>
                  <span>
                    {invoice &&
                      formatCurrency(
                        (invoice.igst + invoice.cgst + invoice.sgst) / 100 * invoice.totalAmount
                      )}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-semibold">
                    {invoice && formatCurrency(invoice.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-green-600">
                    {invoice && formatCurrency(invoice.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t">
                  <span className="font-semibold">Balance Due</span>
                  <span className="font-semibold text-red-600">
                    {invoice &&
                      formatCurrency(invoice.netAmount - invoice.amountPaid)}
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Client & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {invoice?.client.name}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {invoice?.client.address}
                  </p>
                </div>
                {invoice?.client.email && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Email
                    </span>
                    <p>{invoice.client.email}</p>
                  </div>
                )}
                {invoice?.client.phone && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Phone
                    </span>
                    <p>{invoice.client.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Invoices Component */}
            {invoice && (
              <PastInvoices
                customerId={invoice.client.id}
                currentInvoiceId={invoice.id}
                onClose={() => { }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="print:hidden">
        {/* This div will contain elements that should not be printed */}
        {/* For example, buttons or interactive elements */}
      </div>
    </div>
  );
};

export default InvoiceDetails;