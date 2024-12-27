import React, { useRef } from "react";
import { QRCodeCanvas } from 'qrcode.react';
import { toWords } from 'number-to-words';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, User2, CreditCard, Truck, } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Company } from "@/types/Company";
import { Invoice } from "@/types/Invoice";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceItem {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
  unit: string;
  crateId?: number;
  crateName?: string;
  crateQuantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface Taxes {
  igst: number;
  cgst: number;
  sgst: number;
}

interface Totals {
  totalPrice: number;
  igstPrice: number;
  cgstPrice: number;
  sgstPrice: number;
  totalTax: number;
  netAmount: number;
}

interface Car {
  driverName: string;
  carNumber: string;
}

interface InvoiceProps {
  customer?: Customer;
  company?: Company;
  items: InvoiceItem[];
  taxes: Taxes;
  totals: Totals;
  car?: Car;
  amountPaid?: number;
  createdInvoice?: Invoice;
}

const CreateInvoice: React.FC<InvoiceProps> = ({
  customer,
  company,
  items,
  totals,
  car,
  createdInvoice,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceNumber = createdInvoice
    ? `INV-${createdInvoice.id}`
    : `INV-${String(Date.now()).slice(-6)}`;
  const netAmountInWords = totals?.netAmount ? toWords(totals.netAmount.toFixed(2)) : '';
  const upiString = company?.upi
    ? `upi://pay?pa=${company.upi}&pn=${encodeURIComponent(company.name)}&cu=INR`
    : '';

  const downloadPDF = () => {
    const input = invoiceRef.current;
    if (input) {
      html2canvas(input, {
        scale: 2,
        backgroundColor: '#ffffff'
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        const fileName = `${customer?.name.replace(/\s+/g, '_')}_${invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      });
    }
  };

  // const handlePrint = () => {
  //   const printContent = invoiceRef.current;
  //   if (printContent) {
  //     const originalContents = document.body.innerHTML;
  //     document.body.innerHTML = printContent.innerHTML;

  //     // Add print-specific styles
  //     const style = document.createElement('style');
  //     style.innerHTML = `
  //       @media print {
  //         body { padding: 10mm; }
  //         @page { margin: 20mm; }
  //         button { display: none !important; }
  //         .no-print { display: none !important; }
  //         .print\\:visible { display: block !important; }
  //         .print\\:hidden { display: none !important; }
  //       }
  //     `;
  //     document.head.appendChild(style);

  //     window.print();

  //     // Restore original content
  //     document.body.innerHTML = originalContents;
  //     window.location.reload();
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      <Card className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none">
        <CardContent className="p-8 relative" ref={invoiceRef}>
          {/* Header with improved styling */}
          <div className="mb-8 border-b pb-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{company?.name}</h1>
                <p className="text-sm text-gray-600 max-w-md">{company?.address}</p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-2xl font-bold text-gray-900">Invoice #{invoiceNumber}</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-6 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-700">GST</p>
                <p className="text-gray-600 mt-1">{company?.gst || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-700">FSSAI</p>
                <p className="text-gray-600 mt-1">{company?.fssai || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-700">Contact</p>
                <p className="text-gray-600 mt-1">{company?.phone || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-700">Email</p>
                <p className="text-gray-600 mt-1">{company?.email || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Bill To & Payment Details with enhanced styling */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <User2 className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Bill To</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{customer?.name}</p>
                <p className="text-gray-600">{customer?.address}</p>
                <p className="text-gray-600">{customer?.phone}</p>
                <p className="text-gray-600">{customer?.email}</p>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Bank: <span className="font-medium">{company?.bankName || "N/A"}</span></p>
                <p className="text-gray-600">A/C: <span className="font-medium">{company?.accountNumber || "N/A"}</span></p>
                <p className="text-gray-600">IFSC: <span className="font-medium">{company?.ifsc || "N/A"}</span></p>
                <p className="text-gray-600">UPI: <span className="font-medium">{company?.upi || "N/A"}</span></p>
              </div>
            </div>
          </div>

          {/* Car Details with improved styling */}
          {car && (
            <div className="mb-8">
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <h2 className="font-semibold text-gray-900">Car Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="text-gray-600">Driver: <span className="font-medium">{car.driverName}</span></p>
                  <p className="text-gray-600">Car Number: <span className="font-medium">{car.carNumber}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Items Table with enhanced styling */}
          <div className="mb-8 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Item</TableHead>
                  <TableHead className="text-right font-semibold">Qty</TableHead>
                  <TableHead className="text-right font-semibold">Unit</TableHead>
                  <TableHead className="text-right font-semibold">Rate</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items && items.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unit}</TableCell>
                    <TableCell className="text-right">₹{item.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.totalPrice?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Section with improved layout */}
          <div className="flex justify-between items-start mb-32">
            {upiString && (
              <div className="border rounded-lg p-6 text-center bg-gray-50 print:visible">
                <QRCodeCanvas
                  value={upiString}
                  size={150}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
                <p className="text-sm mt-4 text-gray-600">Scan to pay via UPI</p>
              </div>
            )}

            <div className="border rounded-lg p-6 w-96 bg-gray-50">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totals?.totalPrice ? totals.totalPrice.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{totals.totalTax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{totals.netAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">Amount in words: {netAmountInWords} only</p>
              </div>
            </div>
          </div>

          {/* Signature Section with improved styling */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-t-2 border-gray-300 pt-4">
                <p className="text-sm text-gray-600">Customer Signature</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-300 pt-4">
                <p className="text-sm text-gray-600">Company Signature</p>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg space-x-3 print:hidden">
          {/* <Button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-600 gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button> */}
          <Button onClick={downloadPDF} className="bg-black hover:bg-gray-800 gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateInvoice;
