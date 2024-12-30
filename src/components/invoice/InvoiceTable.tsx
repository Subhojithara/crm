"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, FileText, Download, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Invoice } from '@/types/Invoice'
import InvoiceTransaction from './InvoiceTransaction'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { Customer } from '@/types/Customer'
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import InvoiceDownloadAndPreview from '@/components/invoice/InvoiceDownloadAndPreview'
import { useUser } from "@clerk/nextjs"

interface InvoiceTableProps {
  customerId?: number;
  customer?: Customer;
}

interface FetchError extends Error {
  message: string;
}

export default function InvoiceTable({ customerId }: InvoiceTableProps) {
  const { user } = useUser();
  const { toast } = useToast()
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<Invoice | null>(null)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = React.useState(false)
  const [transactionInvoice, setTransactionInvoice] = React.useState<Invoice | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [userRole, setUserRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/users/profile?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.profile.role);
        } else {
          console.error("Failed to fetch user role");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    if (user?.id) {
      fetchUserRole();
    }
  }, [user?.id]);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let url = '/api/invoiceTable';
        if (customerId) {
          url += `?customerId=${customerId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data: Invoice[] = await response.json();
        setInvoices(data);
      } catch (error) {
        const fetchError = error as FetchError;
        setError(fetchError.message || 'Failed to fetch invoices');
        toast({
          title: 'Error',
          description: fetchError.message || 'Failed to fetch invoices',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [customerId, toast]);

  const refreshInvoices = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/invoiceTable';
      if (customerId) {
        url += `?customerId=${customerId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      setInvoices(data);
    } catch (error) {
      const fetchError = error as FetchError;
      setError(fetchError.message || 'Failed to fetch invoices');
      toast({
        title: 'Error',
        description: fetchError.message || 'Failed to fetch invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleDeleteInvoice = React.useCallback(async (invoice: Invoice) => {
    try {
      console.log('Attempting to delete invoice:', invoice.id);
      const response = await fetch('/api/invoiceTable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete invoice:', errorText);
        throw new Error('Failed to delete invoice');
      }

      toast({ title: 'Success', description: 'Invoice deleted successfully!' });
      refreshInvoices();
    } catch (error) {
      const deleteError = error as FetchError;
      console.error('Error deleting invoice:', deleteError);
      toast({
        title: 'Error',
        description: deleteError.message || 'Failed to delete invoice',
        variant: 'destructive',
      });
    }
  }, [refreshInvoices]);

  const exportToExcel = () => {
    if (invoices.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no data to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportData = invoices.map(invoice => ({
      'Invoice ID': invoice.id,
      'Company Name': invoice.company.name,
      'Company Address': invoice.company.address,
      'Customer Name': invoice.client.name,
      'Customer Email': invoice.client.email,
      'Customer Phone': invoice.client.phone,
      'Customer Address': invoice.client.address,
      'Driver Name': typeof invoice.driverName === 'string' ? invoice.driverName : '',
      'Car Number': typeof invoice.vehicleNumber === 'string' ? invoice.vehicleNumber : '',
      'Net Amount': invoice.netAmount,
      'Amount Paid': invoice.amountPaid,
      'Receiving Amount': invoice.netAmount - invoice.amountPaid,
      'Payment Status': invoice.paymentStatus,
      'Payment Method': invoice.paymentMethod || 'N/A',
      'Total Amount': invoice.totalAmount,
      'IGST': invoice.igst,
      'CGST': invoice.cgst,
      'SGST': invoice.sgst,
      'Created At': invoice.createdAt,
      'Updated At': invoice.updatedAt,
      'Items': invoice.invoiceItems.map((item: { productName: string; quantity: number; unit: string; price: number }) =>
        `Product: ${item.productName}, Quantity: ${item.quantity}, Unit: ${item.unit}, Price: ${item.price}`
      ).join(' | '),
      'Payments': invoice.payments ? invoice.payments.map((payment: { amount: number; paymentMethod: string; paymentDate: string }) =>
        `Amount: ${payment.amount}, Method: ${payment.paymentMethod}, Date: ${payment.paymentDate}`
      ).join(' | ') : 'No Payments',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, 'invoices.xlsx');

    toast({
      title: 'Success',
      description: 'Invoices exported successfully!',
      variant: 'default',
    });
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Invoice ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: info => (
        <Link href={`/dashboard/invoices/${info.row.original.id}`} className="hover:underline">
          <FileText className="inline mr-2 h-4 w-4" />
          {String(info.getValue())}
        </Link>
      ),
    },
    {
      accessorKey: 'client.name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'netAmount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Net Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: info => `₹${(info.getValue() as number).toFixed(2)}`,
    },
    {
      accessorKey: 'amountPaid',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Paid Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: info => `₹${(info.getValue() as number).toFixed(2)}`,
    },
    {
      id: 'receivingAmount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Receiving Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const netAmount = row.original.netAmount;
        const amountPaid = row.original.amountPaid;
        const receivingAmount = netAmount - amountPaid;
        return `₹${receivingAmount.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const isAdmin = userRole === "ADMIN";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setTransactionInvoice(row.original);
                  setIsTransactionDialogOpen(true);
                }}
              >
                Record Payment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setInvoiceToDelete(row.original);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <InvoiceDownloadAndPreview invoice={row.original} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: invoices,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
          <div className="dashboard-container space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        );
      }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Invoices..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="default"
          onClick={exportToExcel}
          className="flex items-center ml-2"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      <ScrollArea>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (invoiceToDelete) {
                  handleDeleteInvoice(invoiceToDelete);
                  setIsDeleteDialogOpen(false);
                  setInvoiceToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {transactionInvoice && isTransactionDialogOpen && (
        <InvoiceTransaction
          invoice={transactionInvoice}
          isOpen={isTransactionDialogOpen}
          onClose={() => setIsTransactionDialogOpen(false)}
          onTransactionComplete={() => {
            setIsTransactionDialogOpen(false);
            setTransactionInvoice(null);
            refreshInvoices();
          }}
        />
      )}
    </div>
  )
}
