'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Crate } from '@/types/Crate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react';
import EditCrateDialog from './EditCrateDialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

const CrateTable = () => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [deletingCrateId, setDeletingCrateId] = useState<number | null>(null);
  const [editingCrate, setEditingCrate] = useState< Crate | null >(null);
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCrates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/crates');
      if (!response.ok) {
        throw new Error('Failed to fetch crates');
      }
      const data = await response.json();
      setCrates(data.crates);
    } catch (error) {
      console.error('Error fetching crates:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCrates();
  }, [fetchCrates]);

  const handleDelete = async (id: number) => {
    setIsDeleteLoading(true);
    setDeletingCrateId(id);
    try {
      const response = await fetch(`/api/crates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete crate');
      }

      // Update the crates state to remove the deleted crate
      setCrates((prevCrates) => prevCrates.filter((crate) => crate.id !== id));
      toast({
        title: 'Success',
        description: 'Crate deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting crate:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
      setDeletingCrateId(null);
    }
  };

  const handleUpdateCrate = (updatedCrate: Crate) => {
    setCrates((prevCrates) =>
      prevCrates.map((crate) =>
        crate.id === updatedCrate.id ? updatedCrate : crate
      )
    );
  };

  const handleBulkDelete = async () => {
    setIsDeleteLoading(true);
    const selectedIds = Object.keys(rowSelection).map(Number);

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/crates/${id}`, {
            method: 'DELETE',
          })
        )
      );

      const allSuccess = responses.every((response) => response.ok);

      if (!allSuccess) {
        throw new Error('Failed to delete some crates');
      }

      // Update the crates state to remove the deleted crates
      setCrates((prevCrates) =>
        prevCrates.filter((crate) => !selectedIds.includes(crate.id))
      );

      // Clear row selection
      setRowSelection({});

      toast({
        title: 'Success',
        description: 'Selected crates deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting crates:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const exportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    // Create a worksheet from the crates data
    const ws = XLSX.utils.json_to_sheet(crates);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = window.URL.createObjectURL(data);

    // Create a link element, use it to download the file and remove it
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `crates${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Crate>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      accessorKey: 'crateId',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Crate ID
            < ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue('crateId')}</div>,
    },
    {
      accessorKey: 'crateName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Crate Name
            < ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.getValue('crateName'),
    },
    {
      accessorKey: 'crateQuantity',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Quantity
            < ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.getValue('crateQuantity'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const crate = row.original;
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
              <DropdownMenuItem onClick={() => setEditingCrate(crate)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(crate.id)}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading && deletingCrateId === crate.id
                  ? 'Deleting...'
                  : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: crates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-2">
          <Input
            placeholder="Filter crates..."
            value={(table.getColumn('crateName')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('crateName')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel}>
            Export to Excel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
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
        </div>
      </div>
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

      {/* Edit Dialog */}
      {editingCrate && (
        <EditCrateDialog
          crate={editingCrate}
          onClose={() => setEditingCrate(null)}
          onUpdate={handleUpdateCrate}
        />
      )}
    </div>
  );
};

export default CrateTable;
