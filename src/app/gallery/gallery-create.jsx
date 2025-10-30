


import React from "react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Loader2, SquarePlus, Upload, X } from "lucide-react";
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
const GalleryCreate = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    gallery_image: "",

  });

  const queryClient = useQueryClient();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [ 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (WebP)");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
    }
  };
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Image is required");
      return;
    }
  
    const token = Cookies.get("token");
    const formDataToSend = new FormData();
    formDataToSend.append("gallery_image", selectedFile);
  
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/gallery`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response?.data.code === 201) {
        toast.success(response.data.message || "Gallery Created Successfully");
        setSelectedFile(null);
        await queryClient.invalidateQueries(["gallery-list"]);
        setOpen(false);
      } else {
        toast.error(response.data.message || "Error while creating Gallery");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Gallery");
    } finally {
      setIsLoading(false);
    }
  };
  


  const removeSelectedFile = () => {
    setSelectedFile(null);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <Button variant="default">
            <SquarePlus className="h-4 w-4" /> Gallery
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New Gallery</h4>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new gallery
            </p>
          </div>
          <div className="grid gap-2">
          <div className="grid gap-2">
              <label className="text-sm font-medium">Gallery Image</label>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    id="gallery_image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="gallery_image"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to upload image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only WebP up to 5MB
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
                "Create Gallery"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GalleryCreate;
