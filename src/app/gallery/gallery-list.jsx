import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Copy, Edit, Eye, Loader2, Search, SquarePlus } from "lucide-react";
import { useState, useEffect } from "react";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import GalleryCreate from "./gallery-create";

const GalleryList = () => {
  const [copiedId, setCopiedId] = useState(false);
  
  const {
    data: faqData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["gallery-list"],
    queryFn: async () => {
      const token = Cookies.get("token");
      
      const response = await axios.get(
        `${BASE_URL}/api/gallery`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data.data;
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = Cookies.get("token");
      const response = await axios.patch(
        `${BASE_URL}/api/gallerys/${id}/status`,
        { gallery_status: status },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch(); // Refresh the data after successful update
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error("Status update failed:", error);
    },
  });

  const handleCopyClipboard = async (id, url, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`URL Copied: ${url}`);
      setCopiedId(id);
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Clipboard copy failed:", error);
    }
  };

  const handleStatusChange = (id, newStatus, e) => {
    e.preventDefault();
    e.stopPropagation();
    statusMutation.mutate({ id, status: newStatus });
  };

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex = row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: "gallery_image",
      id: "Image",
      header: "Image",
      cell: ({ row }) => {
        const first_url = row.original.gallery_url;
        const second_url = row.original.gallery_image;
        const fullUrl = first_url + second_url;
        const id = row.original.id;
        return (
          <div className="text-xs ">
            <img
            src={fullUrl}
            alt="gallery img"
            className=" w-10 h-10"
            
            />
          
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "gallery_url",
      id: "Gallery Url",
      header: "Gallery Url",
      cell: ({ row }) => {
        const first_url = row.original.gallery_url;
        const second_url = row.original.gallery_image;
        const fullUrl = first_url + second_url;
        const id = row.original.id;
        return (
          <div className="text-xs flex gap-4">
            <span>{fullUrl}</span>
            <Copy
              onClick={(e) => handleCopyClipboard(id, fullUrl, e)}
              className={`w-4 h-4 hover:scale-110 transition-all duration-200 cursor-pointer ${
                copiedId === id ? "text-green-600" : "text-red-600"
              }`}
            />
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "gallery_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("Status");
        const id = row.original.id;
        const isUpdating = statusMutation.isLoading && statusMutation.variables?.id === id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  status || "-"
                )}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuCheckboxItem
                checked={status === "Active"}
                onCheckedChange={(checked) => {
                  if (checked) handleStatusChange(id, "Active", event);
                }}
                className="text-xs"
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={status === "Inactive"}
                onCheckedChange={(checked) => {
                  if (checked) handleStatusChange(id, "Inactive", event);
                }}
                className="text-xs"
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 120,
    },
  ];

  const table = useReactTable({
    data: faqData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const TableShimmer = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <TableRow key={index} className="animate-pulse h-11"> 
        {table.getVisibleFlatColumns().map((column) => (
          <TableCell key={column.id} className="py-1">
            <div className="h-8 bg-gray-200 rounded w-full"></div> 
          </TableCell>
        ))}
      </TableRow>
    ));
  };
  
  if (isError) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">
              Error Fetching Subscribe Email Data
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full ">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search subscribe email..."
            value={table.getState().globalFilter || ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Columns <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="text-xs capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <GalleryCreate/>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-none border min-h-[31rem] flex flex-col">
        <Table className="flex-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="h-10 px-3 bg-[var(--team-color)] text-[var(--label-color)] text-sm font-medium"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {isFetching && !table.getRowModel().rows.length ? (
              <TableShimmer />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-2 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="h-12">
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  No subscribe email found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-1">
        <div className="flex-1 text-sm text-muted-foreground">
          Total Subscribe Email : &nbsp;
          {table.getFilteredRowModel().rows.length}
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
    </div>
  );
};

export default GalleryList;