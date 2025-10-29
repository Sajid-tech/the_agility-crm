import React from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Loader2, SquarePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";

import { toast } from "sonner";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";

const SponsorCreate = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    sponsors_sort: "",
    sponsors_url: "",
  });
  
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !formData.sponsors_sort.trim() || !formData.sponsors_url.trim()) {
      toast.error("Sponsor image, sort order, and URL are required");
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('sponsors_image', selectedFile);
      submitData.append('sponsors_sort', formData.sponsors_sort);
      submitData.append('sponsors_url', formData.sponsors_url);

      const response = await axios.post(
        `${BASE_URL}/api/sponsor`,
        submitData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      if (response?.data.code == 201 || response?.status === 201) {
        toast.success(response.data.message || "Sponsor created successfully");

        // Reset form
        setFormData({
          sponsors_sort: "",
          sponsors_url: "",
        });
        setSelectedFile(null);
        await queryClient.invalidateQueries(["sponsorList"]);
        setOpen(false);
      } else {
        toast.error(response.data.message || "Failed to create sponsor");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create sponsor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={`ml-2`}>
          <SquarePlus className="h-4 w-4 mr-2" /> Sponsor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Sponsor</DialogTitle>
          <DialogDescription>
            Enter the details for the new sponsor
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            {/* File Upload Input */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Sponsor Image</label>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    id="sponsors_image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="sponsors_image"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to upload image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          className="w-10 h-10 object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeSelectedFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Input
              id="sponsors_sort"
              type="number"
              placeholder="Enter sort order"
              value={formData.sponsors_sort}
              onChange={handleInputChange}
            />
            <Input
              id="sponsors_url"
              placeholder="Enter sponsor URL"
              value={formData.sponsors_url}
              onChange={handleInputChange}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`mt-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Sponsor"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorCreate;