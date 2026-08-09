import * as React from "react";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Building2, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { DataTablePagination } from "../DataTable/data-table-pagination";
import { DataTableToolbar } from "../DataTable/data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: Row<TData>) => void;
  toolbar?: boolean;
  onChange?: (data: string[]) => void;
  isLoading?: boolean;
  setSearchText?: React.Dispatch<React.SetStateAction<string | undefined>>;
  searchText?: string;
  setRowsPerPage?: (rows: number) => void;
  className?: string;
  pagination?: PaginationState;
  sorting?: SortingState;
  pageCount?: number;
  enableRowSelection?: boolean;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  filters?: Array<{
    columnName: string;
    title: string;
    options: { label: string; value: string }[];
  }>;
  hideRowsPerPage?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onChange,
  toolbar = false,
  isLoading,
  setSearchText,
  searchText,
  pagination,
  sorting,
  pageCount,
  setPagination,
  setSorting,
  enableRowSelection,
  columnFilters,
  setColumnFilters,
  className,
  filters,
  hideRowsPerPage,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    if (onChange) {
      onChange(Object.keys(rowSelection));
    }
  }, [rowSelection, onChange]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter: searchText,
    },
    enableRowSelection: enableRowSelection,
    manualSorting: true,
    // PAGINATION
    manualPagination: true,
    pageCount: pageCount,
    onPaginationChange: setPagination,
    // FILTERING
    manualFiltering: true,
    onGlobalFilterChange: setSearchText,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      {toolbar && <DataTableToolbar table={table} filters={filters} />}
      <div className="relative border rounded-md">
        {isLoading && (
          <div className="absolute left-1/2 top-1/2">
            <LoaderCircle className="h-auto animate-spin" />
          </div>
        )}
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
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length && !isLoading ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer h-14 hover:bg-muted transition-colors"
                  onClick={() => onRowClick && onRowClick(row)}
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
                  {!isLoading && (
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-12 h-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Results Found
                      </h3>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination hideRowsPerPage={hideRowsPerPage} table={table} />
    </div>
  );
}
