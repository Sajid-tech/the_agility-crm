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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Edit, Eye, Loader2, Search, SquarePlus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import useNumericInput from "@/hooks/use-numeric-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BlogList = () => {
  const userType = Cookies.get('user_type_id');
  const queryClient = useQueryClient();
  const keyDown = useNumericInput()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [previousSearchTerm, setPreviousSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageInput, setPageInput] = useState("");
  const storeCurrentPage = () => {
    Cookies.set("blogReturnPage", (pagination.pageIndex + 1).toString(), { 
      expires: 1 
    });
  };


  const handleEditBlog = (id) => {
    storeCurrentPage();
    navigate(`/blog/edit/${id}`);
  };

  const handleViewBlog = (id) => {
    storeCurrentPage();
    navigate(`/blog/view/${id}`);
  };

  
  useEffect(() => {
    const savedPage = Cookies.get("blogReturnPage");
    if (savedPage) {
      Cookies.remove("blogReturnPage");
      
      setTimeout(() => {
        const pageIndex = parseInt(savedPage) - 1;
        if (pageIndex >= 0) {
          setPagination(prev => ({ ...prev, pageIndex }));
          setPageInput(savedPage);
          queryClient.invalidateQueries({
            queryKey: ["blogs"],
            exact: false,
          });
        }
      }, 100);
    }
  }, [queryClient]);


  useEffect(() => {
    const timerId = setTimeout(() => {
      const isNewSearch = searchTerm !== previousSearchTerm && previousSearchTerm !== "";
      
      if (isNewSearch) {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
      }
      
      setDebouncedSearchTerm(searchTerm);
      setPreviousSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, previousSearchTerm]);

  const {
    data: blogsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["blogs", debouncedSearchTerm, pagination.pageIndex + 1],
    queryFn: async () => {
      const token = Cookies.get("token");
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
      });
      
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const response = await axios.get(
        `${BASE_URL}/api/blog?${params}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

 
  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = blogsData?.last_page || 1;
    
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ["blogs", debouncedSearchTerm, nextPage],
        queryFn: async () => {
          const token = Cookies.get("token");
          const params = new URLSearchParams({
            page: nextPage.toString(),
          });
          
          if (debouncedSearchTerm) {
            params.append("search", debouncedSearchTerm);
          }

          const response = await axios.get(
            `${BASE_URL}/api/blog?${params}`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            }
          );
          return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }

    if (currentPage > 1) {
      const prevPage = currentPage - 1;
    
      if (!queryClient.getQueryData(["blogs", debouncedSearchTerm, prevPage])) {
        queryClient.prefetchQuery({
          queryKey: ["blogs", debouncedSearchTerm, prevPage],
          queryFn: async () => {
            const token = Cookies.get("token");
            const params = new URLSearchParams({
              page: prevPage.toString(),
            });
            
            if (debouncedSearchTerm) {
              params.append("search", debouncedSearchTerm);
            }

            const response = await axios.get(
              `${BASE_URL}/api/blog?${params}`,
              {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                },
              }
            );
            return response.data.data;
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [pagination.pageIndex, debouncedSearchTerm, queryClient, blogsData?.last_page]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      id: "S. No.",
      header: "S. No.",
      cell: ({ row }) => {
        const globalIndex = (pagination.pageIndex * pagination.pageSize) + row.index + 1;
        return <div className="text-xs font-medium">{globalIndex}</div>;
      },
      size: 60,
    },
    {
      accessorKey: "blog_title",
      id: "Title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Title
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-[13px] font-medium">{row.getValue("Title")}</div>,
      size: 200,
    },
    {
      accessorKey: "blog_short_description",
      id: "Short Description",
      header: "Short Description",
      cell: ({ row }) => (
        <div className="text-xs line-clamp-2">
          {row.getValue("Short Description")}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "blog_created_date",
      id: "Created Date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2 h-8 text-xs"
        >
          Created Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-xs">{row.getValue("Created Date")}</div>,
      size: 120,
    },
    {
      accessorKey: "blog_featured",
      id: "Featured",
      header: "Featured",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("Featured") === "Yes" 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {row.getValue("Featured")}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "blog_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("Status") === "Active" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {row.getValue("Status")}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div className="flex flex-row">
            {userType !== '4' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditBlog(id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Blog</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: blogsData?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: blogsData?.last_page || -1,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handlePageChange = (newPageIndex) => {
    const targetPage = newPageIndex + 1;
    const cachedData = queryClient.getQueryData(["blogs", debouncedSearchTerm, targetPage]);
    
    if (cachedData) {
      setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    } else {
      table.setPageIndex(newPageIndex);
    }
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    setPageInput(value);
    
    if (value && !isNaN(value)) {
      const pageNum = parseInt(value);
      if (pageNum >= 1 && pageNum <= table.getPageCount()) {
        handlePageChange(pageNum - 1);
      }
    }
  };

  const generatePageButtons = () => {
    const currentPage = pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const buttons = [];
    
    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handlePageChange(0)}
        className="h-8 w-8 p-0 text-xs"
      >
        1
      </Button>
    );

    if (currentPage > 3) {
      buttons.push(<span key="ellipsis1" className="px-2">...</span>);
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i - 1)}
            className="h-8 w-8 p-0 text-xs"
          >
            {i}
          </Button>
        );
      }
    }

    if (currentPage < totalPages - 2) {
      buttons.push(<span key="ellipsis2" className="px-2">...</span>);
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages - 1)}
          className="h-8 w-8 p-0 text-xs"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

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
              Error Fetching Blogs List Data
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
    <div className="max-w-full p-2">
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
              }
            }}
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
          {userType !== '4' && (
            <Link 
              to='/create-blog'
              onClick={storeCurrentPage}
            >
              <Button variant="default">
                <SquarePlus className="h-3 w-3 mr-2" /> Create Blog
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-none border min-h-[31rem] grid grid-cols-1">
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
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          Showing {blogsData?.from || 0} to {blogsData?.to || 0} of{" "}
          {blogsData?.total || 0} blogs
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {generatePageButtons()}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span>Go to</span>
            <Input
              type="tel"
              min="1"
              max={table.getPageCount()}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={() => setPageInput("")}
              onKeyDown={keyDown}
              className="w-16 h-8 text-sm"
              placeholder="Page"
            />
            <span>of {table.getPageCount()}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogList;