import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Invoice } from '@/types/Invoice';
import CreateInvoice from './CreateInvoice';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InvoiceDownloadAndPreviewProps {
  invoice: Invoice;
}

const InvoiceDownloadAndPreview: React.FC<InvoiceDownloadAndPreviewProps> = ({
  invoice,
}) => {
  const [open, setOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Preview Invoice</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview the invoice before downloading.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] w-full">
            <div ref={invoiceRef}>
              <CreateInvoice
                customer={invoice.client}
                company={{
                  ...invoice.company,
                  email: invoice.company.email || '',
                }}
                items={invoice.invoiceItems ? invoice.invoiceItems.map(item => ({
                  ...item,
                  price: item.unitPrice,
                })) : []}
                taxes={{
                  igst: invoice.igst,
                  cgst: invoice.cgst,
                  sgst: invoice.sgst,
                }}
                totals={{
                  totalPrice: invoice.totalAmount,
                  igstPrice: invoice.igst,
                  cgstPrice: invoice.cgst,
                  sgstPrice: invoice.sgst,
                  totalTax: invoice.igst + invoice.cgst + invoice.sgst,
                  netAmount: invoice.netAmount,
                }}
                car={invoice.carDetails}
                amountPaid={invoice.amountPaid}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceDownloadAndPreview;