"use client";

import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toWords } from "number-to-words";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, User2, CreditCard, LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PurchaseInvoiceProps {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  seller: {
    name: string;
    address: string;
    number: string;
    email: string;
  };
  productName: string;
  productQuantity: number;
  purchaseAmount: number;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({
  company,
  seller,
  productName,
  productQuantity,
  purchaseAmount,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const downloadPDF = async () => {
    const input = invoiceRef.current;
    if (input) {
      try {
        const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        const currentDate = new Date().toISOString().split("T")[0];
        pdf.save(`Purchase_Invoice_${currentDate}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        // Consider adding user-friendly error handling here, e.g., a toast notification.
      }
    }
  };

  const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;
  const totalAmount = productQuantity * purchaseAmount;
  const totalAmountInWords = toWords(totalAmount);

  const InfoCard = ({ icon: Icon, title, children }: { icon: LucideIcon, title: string, children: React.ReactNode }) => (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Generate Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <div className="min-h-screen bg-gray-100 p-8">
          <Card className="max-w-5xl mx-auto bg-white shadow-lg">
            <CardContent className="p-8" ref={invoiceRef}>
              {/* Header */}
              <div className="flex justify-between items-start mb-12 border-b pb-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-500 max-w-md text-sm">{company.address}</p>
                  {company.phone && <p className="text-gray-500 text-sm">{company.phone}</p>}
                  {company.email && <p className="text-gray-500 text-sm">{company.email}</p>}
                </div>
                <div className="text-right space-y-2">
                  <div className="">
                    <p className="text-2xl font-bold">Invoice #{invoiceNumber}</p>
                    <p className="text-sm mt-1">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <InfoCard icon={User2} title="Bill To">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900">{seller.name}</p>
                    <p className="text-gray-500">{seller.address}</p>
                    <p className="text-gray-500">{seller.number}</p>
                    <p className="text-gray-500">{seller.email}</p>
                  </div>
                </InfoCard>

                <InfoCard icon={CreditCard} title="Payment Details">
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-500">UPI: {seller.email}</p>
                  </div>
                </InfoCard>
              </div>

              {/* Items Table */}
              <div className="mb-12 rounded-lg overflow-hidden border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="text-right font-semibold">Quantity</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium">{productName}</TableCell>
                      <TableCell className="text-right">{productQuantity}</TableCell>
                      <TableCell className="text-right">₹{totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Summary Section */}
              <div className="flex justify-between items-start mb-12">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <QRCodeCanvas value={`upi://pay?pa=${seller.email}&pn=${seller.name}&cu=INR`} size={120} />
                  <p className="text-sm text-gray-500 mt-2">Scan to pay via UPI</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg w-96">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">({totalAmountInWords} Rupees)</p>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 mt-16">
                <div className="text-center">
                  <Separator className="mb-4" />
                  <p className="text-sm text-gray-500">Seller Signature</p>
                </div>
                <div className="text-center">
                  <Separator className="mb-4" />
                  <p className="text-sm text-gray-500">Company Signature</p>
                </div>
              </div>
            </CardContent>

            <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
              <Button
                onClick={downloadPDF}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvoice;
