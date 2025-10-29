import React from "react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Edit, Loader2, SquarePen } from "lucide-react";
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

const CategoryEdit = ({ category }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_name: category?.category_name || "",
    category_status: category?.category_status || "",
  });

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      toast({
        title: "Error",
        description: "Chapter type is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/category/${category.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 201) {
        toast.success(response.data.message || 'category Updated Successfully');
        
        setFormData({
          category_name: "",
          category_status:""
        });
        
        await queryClient.invalidateQueries(["category-list"]);
        
        
        setOpen(false);
      } else {
        toast.error(response.data.message || 'Error while updating category');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

 
  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, category_status: value }));
  };
  React.useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || "",
        category_status: category.category_status || "",
      });
    }
  }, [category]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
      <Button
           variant="ghost"
           size="icon"
         >
           <Edit className="h-4 w-4" />
         </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Edit Category
            </h4>
            <p className="text-sm text-muted-foreground">
              Update the details for the Category
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="category_name"
              placeholder="Enter Category Type"
              value={formData.category_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category_name: e.target.value,
                }))
              }
            />
 <Select
                        value={formData.category_status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Category"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryEdit;