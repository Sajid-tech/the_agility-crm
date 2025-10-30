import React from "react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Loader2, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
const CategoryCreate = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_name: "",
    category_status: "Active",
  });
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      toast({
        title: "Error",
        description: "Category Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.post(`${BASE_URL}/api/category`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data.code == 201) {
        toast.success(response.data.message || "Category Created Successfully");

        setFormData({
          category_name: "",
        });
        await queryClient.invalidateQueries(["category-list"]);
  
        setOpen(false);
      } else {
        toast.error(response.data.message || "Error while creating Category");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          
          {pathname === "/category" ? (
          <Button  type="button" variant="default">
          <SquarePlus className="h-4 w-4" /> Category
        </Button>
        ) : pathname === "/create-blog" ? (
         <p className="text-xs text-blue-600  hover:text-red-800 cursor-pointer">
                   <span className="flex items-center flex-row gap-1">
                     <SquarePlus className="w-4 h-4" /> <span>Add</span>
                   </span>
                 </p>
        ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New Category</h4>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new category
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="category_name"
              placeholder="Enter category Type"
              value={formData.category_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category_name: e.target.value,
                }))
              }
            />

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`mt-2  `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryCreate;
