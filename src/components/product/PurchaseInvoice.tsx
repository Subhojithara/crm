import React, { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toWords } from "number-to-words";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Download,
  User2,
  Building,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Company } from "@/types/Company";
import { Seller } from "@/types/Seller"; 
import { ProductPurchase } from "@/types/Product";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PurchaseInvoiceProps {
  company: Company | null;
  seller: Seller | null;
  purchases: ProductPurchase[];
}

const PurchaseInvoice = ({
  company,
  seller,
  purchases,
}: PurchaseInvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const totalAmount = purchases.reduce((sum, purchase) => {
    return (
      sum +
      (isNaN(purchase.productQuantity) || isNaN(purchase.purchaseAmount)
        ? 0
        : purchase.productQuantity * purchase.purchaseAmount)
    );
  }, 0);
  const totalAmountInWords = !isNaN(totalAmount) ? toWords(totalAmount) : "";
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",  
    day: "numeric",
  });

  const downloadPDF = async () => {
    if (invoiceRef.current) {
      const pages = document.querySelectorAll(".invoice-page");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 4, // Increased scale for better quality
          logging: false,
          useCORS: true,
          windowWidth: 794, // A4 width in pixels @96 DPI
          windowHeight: 1123, // A4 height in pixels @96 DPI
          backgroundColor: '#FFFFFF',
          imageTimeout: 0,
          onclone: (document) => {
            // Fix font and styling issues in the cloned document
            const styles = document.createElement('style');
            styles.innerHTML = `
              * { 
                font-family: Arial, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            `;
            document.head.appendChild(styles);
          }
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      }

      pdf.save(`${purchases[0]?.id}_purchase_invoice.pdf`);
    }
  };

  // Calculate available space for items considering header and seller details
  const itemsOnFirstPage = 5;
  const itemsOnOtherPages = 8;

  const pagesArr: { items: ProductPurchase[]; isLastPage: boolean }[] = [];
  const remainingItemsArr: ProductPurchase[] = [...purchases];
  let currentItems: ProductPurchase[] = [];

  while (remainingItemsArr.length > 0) {
    const maxItems: number = pagesArr.length === 0 ? itemsOnFirstPage : itemsOnOtherPages;
    currentItems = remainingItemsArr.splice(0, maxItems);

    pagesArr.push({
      items: currentItems,
      isLastPage: remainingItemsArr.length === 0
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-gray-50">
          <Receipt className="w-4 h-4" />
          Generate Purchase Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px]">
        <ScrollArea className="h-[80vh] w-full rounded-md">
          <div ref={invoiceRef} className="print-container">
            {pagesArr.map((page, pageIndex) => {
              return (
                <div
                  key={pageIndex}
                  className="invoice-page bg-white w-[210mm] h-[297mm] relative mb-8 shadow-lg"
                  style={{ margin: "0 auto" }}
                >
                  {/* Header Section */}
                  <div className="p-4 bg-gray-100">
                  <div className=" text-black">
                    <div className="">
                          <p className="text-sm text-zinc-500 font-semibold uppercase">
                            Purchase Bill
                          </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {company && (
                          <>
                            <div>
                              <h1 className="text-2xl font-bold">
                                {company.name}
                              </h1>
                              <p className="text-sm text-gray-600 mt-1">
                                {company.address}
                              </p>
                              <div className="text-xs text-gray-600 mt-1">
                                GST: {company.gst}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                        
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-sm">
                          <p className="text-gray-600">
                            Bill No: <span className="font-medium">#{purchases[0]?.id}</span>
                          </p>
                          <p className="text-gray-600">{currentDate}</p>
                          <p className="text-gray-500 text-xs">
                            Page {pageIndex + 1} of {pagesArr.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="p-10 space-y-8">
                    {pageIndex === 0 && (
                      <div className="grid grid-cols-2 gap-8">
                        {/* Seller Details */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <User2 className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="font-medium">Seller Details</p>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <Building className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {seller?.name}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {seller?.address}
                                  </p>
                                </div>
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">
                                      Contact
                                    </p>
                                    <p className="text-sm">{seller?.number}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">
                                      Email
                                    </p>
                                    <p className="text-sm break-all">
                                      {seller?.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="font-medium">Payment Details</p>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Bank Details
                                </p>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    Bank:{" "}
                                    <span className="text-gray-900">
                                      {company?.bankName}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    A/C:{" "}
                                    <span className="text-gray-900">
                                      {company?.accountNumber}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    IFSC:{" "}
                                    <span className="text-gray-900">
                                      {company?.ifsc}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Digital Payment
                                </p>
                                <p className="text-sm text-gray-600">
                                  UPI:{" "}
                                  <span className="text-gray-900">
                                    {company?.upi}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products Table */}
                    <div className="mt-8">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="w-1/2 font-semibold text-gray-900">
                              Item Description
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-900">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-900">
                              Rate
                            </TableHead>
                            <TableHead className="text-right font-semibold text-gray-900">
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {page.items.map((purchase) => (
                            <TableRow
                              key={purchase.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="font-medium">
                                {purchase.productName}
                              </TableCell>
                              <TableCell className="text-right">
                                {purchase.productQuantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {purchase.purchaseAmount?.toFixed(2) ||
                                  "0.00"}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ₹
                                {(
                                  purchase.productQuantity *
                                  purchase.purchaseAmount
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {page.isLastPage && (
                      <>
                        <div className="flex justify-end mt-8">
                          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 w-96">
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span className="text-gray-700">
                                Total Amount
                              </span>
                              <span className="text-gray-900">
                                ₹{totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <Separator className="my-3 bg-gray-200" />
                            <p className="text-sm text-gray-600 italic">
                              {totalAmountInWords} Rupees Only
                            </p>
                          </div>
                        </div>

                        <div className="mt-16 absolute bottom-20 w-[calc(100%-5rem)]">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="text-center">
                              <Separator className="mb-4" />
                              <p className="text-sm font-medium text-gray-900">
                                Seller&apos;s Signature
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {seller?.name}
                              </p>
                            </div>
                            <div className="text-center">
                              <Separator className="mb-4" />
                              <p className="text-sm font-medium text-gray-900">
                                Company&apos;s Signature
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {company?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="mt-8 flex justify-end download-button">
          <Button
            onClick={downloadPDF}
            className="bg-gray-900 hover:bg-gray-800 gap-2 text-white"
          >
            <Download className="w-4 h-4" />
            Download Bill
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvoice;
