"use client"

import { useEffect, useState, useMemo } from 'react'
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
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import * as XLSX from 'xlsx';
import { Skeleton } from '@/components/ui/skeleton';

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
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
import { ProductPurchase } from '@/types/Product'
import { Company } from '@/types/Company'
import { Seller } from '@/types/Seller'
import EditPurchase from './EditePurchase'
import { toast } from '@/hooks/use-toast'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

type PurchaseData = ProductPurchase & {
  companyName: string
  sellerName: string
}

const PurchaseTable = () => {
  const [productPurchases, setProductPurchases] = useState<PurchaseData[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [purchaseResponse, companyResponse, sellerResponse] = await Promise.all([
          fetch('/api/product-purchase'),
          fetch('/api/company'),
          fetch('/api/seller')
        ]);

        if (!purchaseResponse.ok) {
          console.error("Failed to fetch purchase data");
          throw new Error(`Failed to fetch purchase data: ${purchaseResponse.statusText}`);
        }
        if (!companyResponse.ok) {
          console.error("Failed to fetch company data");
          throw new Error(`Failed to fetch company data: ${companyResponse.statusText}`);
        }
        if (!sellerResponse.ok) {
          console.error("Failed to fetch seller data");
          throw new Error(`Failed to fetch seller data: ${sellerResponse.statusText}`);
        }

        const purchaseData: ProductPurchase[] = await purchaseResponse.json();
        const companyData: { companies: Company[] } = await companyResponse.json();
        const sellerData: Seller[] = await sellerResponse.json();

        const enrichedPurchaseData: PurchaseData[] = purchaseData.map(purchase => ({
          ...purchase,
          companyName: companyData.companies.find(company => company.id === parseInt(purchase.companyId))?.name || 'Unknown',
          sellerName: sellerData.find(seller => seller.id === parseInt(purchase.sellerId))?.name || 'Unknown'
        }));

        setProductPurchases(enrichedPurchaseData);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error",
          description: "There was an error fetching data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeletePurchase = async (id: string) => {
    try {
      const response = await fetch('/api/product-purchase', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [id] }), // Send as an array
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase');
      }

      // Remove the deleted purchase from the state
      setProductPurchases(productPurchases.filter(purchase => purchase.id !== id));

      toast({
        title: "Success",
        description: "Purchase deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the purchase.",
        variant: "destructive"
      });
    }
  };

  const handleEditComplete = async () => {
    setSelectedPurchase(null);
    setIsLoading(true);
    try {
      const [purchaseResponse, companyResponse, sellerResponse] = await Promise.all([
        fetch('/api/product-purchase'),
        fetch('/api/company'),
        fetch('/api/seller')
      ]);

      if (!purchaseResponse.ok) {
        console.error("Failed to fetch purchase data");
        throw new Error(`Failed to fetch purchase data: ${purchaseResponse.statusText}`);
      }
      if (!companyResponse.ok) {
        console.error("Failed to fetch company data");
        throw new Error(`Failed to fetch company data: ${companyResponse.statusText}`);
      }
      if (!sellerResponse.ok) {
        console.error("Failed to fetch seller data");
        throw new Error(`Failed to fetch seller data: ${sellerResponse.statusText}`);
      }

      const purchaseData: ProductPurchase[] = await purchaseResponse.json();
      const companyData: { companies: Company[] } = await companyResponse.json();
      const sellerData: Seller[] = await sellerResponse.json();

      const enrichedPurchaseData: PurchaseData[] = purchaseData.map(purchase => ({
        ...purchase,
        companyName: companyData.companies.find(company => company.id === parseInt(purchase.companyId))?.name || 'Unknown',
        sellerName: sellerData.find(seller => seller.id === parseInt(purchase.sellerId))?.name || 'Unknown'
      }));

      setProductPurchases(enrichedPurchaseData);
    } catch (err) {
      console.error('Error fetching updated data:', err);
      toast({
        title: "Error",
        description: "There was an error fetching updated data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<PurchaseData>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "companyName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Company
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("companyName")}</div>,
      },
      {
        accessorKey: "sellerName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Seller
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("sellerName")}</div>,
      },
      {
        accessorKey: "productName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Product Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("productName")}</div>,
      },
      {
        accessorKey: "productQuantity",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Quantity
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const quantity = parseFloat(row.getValue("productQuantity"))

          return (
            <div className="text-right font-medium">
              {quantity}
            </div>
          )
        },
      },
      {
        accessorKey: "purchaseAmount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("purchaseAmount"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
          }).format(amount)

          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: 'status',
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
        cell: ({ row }) => <div className="lowercase">{row.getValue('status')}</div>,
      },
      {
        accessorKey: "received",
        header: "Received",
        cell: ({ row }) => <div className="lowercase">{row.getValue("received")}</div>,
      },
      {
        accessorKey: "leaf",
        header: "Leaf",
        cell: ({ row }) => <div className="lowercase">{row.getValue("leaf")}</div>,
      },
      {
        accessorKey: "rej",
        header: "Rej",
        cell: ({ row }) => <div className="lowercase">{row.getValue("rej")}</div>,
      },
      {
        accessorKey: "shortage",
        header: "Shortage",
        cell: ({ row }) => <div className="lowercase">{row.getValue("shortage")}</div>,
      },
      {
        accessorKey: "kantaWeight",
        header: "Kanta Weight",
        cell: ({ row }) => <div className="lowercase">{row.getValue("kantaWeight")}</div>,
      },
      {
        accessorKey: "truckNumber",
        header: "Truck Number",
        cell: ({ row }) => <div className="lowercase">{row.getValue("truckNumber")}</div>,
      },
      {
        accessorKey: "chNo",
        header: "CH NO",
        cell: ({ row }) => <div className="lowercase">{row.getValue("chNo")}</div>,
      },
      {
        accessorKey: "fare",
        header: "Fare",
        cell: ({ row }) => <div className="lowercase">{row.getValue("fare")}</div>,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <div className="lowercase">{row.getValue("remarks")}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const purchase = row.original

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
                  onClick={() => navigator.clipboard.writeText(purchase.id)}
                >
                  Copy purchase ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setSelectedPurchase(purchase);
                }}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeletePurchase(purchase.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleDeletePurchase]
  );

  const table = useReactTable({
    data: productPurchases,
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(productPurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Purchases");
    XLSX.writeFile(workbook, "product_purchases.xlsx");
  };
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id || Math.random().toString()}>
                    <Skeleton className="h-8 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.id || Math.random().toString()}`}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter purchases..."
          value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("productName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={exportToExcel}>Export to Excel</Button>
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
                    key={row.original.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={`${row.original.id}-${cell.id}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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

      {selectedPurchase && (
        <EditPurchase purchase={selectedPurchase} onEditComplete={handleEditComplete} />
      )}
    </div>
  )
}

export default PurchaseTable
