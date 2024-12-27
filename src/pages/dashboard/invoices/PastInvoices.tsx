import React, { useEffect, useState } from 'react';
import { Invoice } from '@/types/Invoice';
import { getPastInvoices } from '@/lib/invoiceService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, History } from 'lucide-react';

interface PastInvoicesProps {
  customerId: number;
  currentInvoiceId: number;
  onClose: () => void;
}

const PastInvoices: React.FC<PastInvoicesProps> = ({
  customerId,
  currentInvoiceId,
}) => {
  const { toast } = useToast();
  const [pastInvoices, setPastInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPastInvoices = async () => {
      setLoading(true);
      const invoices = await getPastInvoices(customerId, currentInvoiceId);
      if (invoices.length === 0) {
        toast({
          title: 'No Past Invoices',
          description: 'This customer has no past invoices.',
          variant: 'default',
        });
      }
      setPastInvoices(invoices);
      setLoading(false);
    };

    fetchPastInvoices();
  }, [customerId, currentInvoiceId, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (pastInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50 rounded-lg">
        <History className="w-12 h-12 text-gray-400" />
        <p className="text-gray-500 text-lg">No past invoices found for this customer.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full hover:bg-gray-50 transition-colors"
        >
          <History className="w-4 h-4 mr-2" />
          View Past Invoices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Past Invoices</DialogTitle>
          <DialogDescription className="text-gray-500">
            View and manage previous invoices for this customer
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white rounded-lg mt-4">
          <ScrollArea className="h-[500px] w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Invoice ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        #{invoice.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        
                        ₹{invoice.netAmount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(invoice.paymentStatus)} px-3 py-1`}>
                        {invoice.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <DialogFooter className="mt-6">
          {/* <Button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PastInvoices;