import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import BASE_URL from '@/config/base-url';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Upload } from "lucide-react";



import { CKEditor } from "ckeditor4-react";
import { toast } from 'sonner';
const BlogCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const [formData, setFormData] = useState({
    blog_title: '',
    blog_slug: '',
    blog_short_description: '',
    blog_description: '',
    blog_banner_image: null,
    blog_categories_ids: [],
    blog_front: '',
    blog_featured: 'No',
 
  });

  const [imagePreview, setImagePreview] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');


  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${BASE_URL}/api/activeCategorys`,
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

  useEffect(() => {
    if (formData.blog_title) {
      const slug = formData.blog_title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') 
        .replace(/[\s_-]+/g, '-') 
        .replace(/^-+|-+$/g, ''); 
      
      setFormData(prev => ({ ...prev, blog_slug: slug }));
    }
  }, [formData.blog_title]);


  useEffect(() => {
    if (categoriesData) {
      setAvailableCategories(categoriesData);
    }
  }, [categoriesData]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, blog_banner_image: file }));
      

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const removeBannerImage = () => {
    setFormData(prev => ({ ...prev, blog_banner_image: null }));
    setImagePreview('');
  };


  const addCategory = () => {
    if (selectedCategory && !formData.blog_categories_ids.includes(selectedCategory)) {
      setFormData(prev => ({
        ...prev,
        blog_categories_ids: [...prev.blog_categories_ids, selectedCategory]
      }));
      setSelectedCategory('');
    }
  };


  const removeCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      blog_categories_ids: prev.blog_categories_ids.filter(id => id !== categoryId)
    }));
  };


  const createBlogMutation = useMutation({
    mutationFn: async (blogData) => {
      const token = Cookies.get("token");
      

      const formDataToSend = new FormData();
      

      Object.keys(blogData).forEach(key => {
        if (key === 'blog_categories_ids') {

            formDataToSend.append(key, blogData[key].join(','));
        } else if (key === 'blog_banner_image' && blogData[key]) {
          formDataToSend.append(key, blogData[key]);
        } else {
          formDataToSend.append(key, blogData[key]);
        }
      });

      const response = await axios.post(
        `${BASE_URL}/api/blog`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );
      return response.data;
    },
    onSuccess: async(data) => {

      navigate('/blog');
      toast.success(data.message || "blog created successfully")
      await queryClient.invalidateQueries(["blogs"]);
    },
    onError: (error) => {
      console.error('Error creating blog:', error.response.data.message);
        toast.error(error.response.data.message || "Error creating blog")
    },
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    createBlogMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Blog Title */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className="">
              <Label htmlFor="blog_title">Blog Title *</Label>
              <Textarea
                id="blog_title"
                value={formData.blog_title}
                onChange={(e) => handleInputChange('blog_title', e.target.value)}
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Blog Slug */}
            <div className="">
              <Label htmlFor="blog_slug">Blog Slug *</Label>
              <Textarea
                id="blog_slug"
                value={formData.blog_slug}
                onChange={(e) => handleInputChange('blog_slug', e.target.value)}
                placeholder="Blog slug will be generated automatically"
                required
              />
              <p className="text-sm text-gray-500">
                This will be used in the URL. Automatically generated from title.
              </p>
            </div>
            </div>
            {/* Blog Short Description */}
            <div className="">
              <Label htmlFor="blog_short_description">Short Description *</Label>
              <Textarea
                id="blog_short_description"
                value={formData.blog_short_description}
                onChange={(e) => handleInputChange('blog_short_description', e.target.value)}
                placeholder="Enter a brief description of the blog"
                rows={3}
                required
              />
            </div>

            {/* Blog Description - CKEditor */}
            <div className="">
              <Label htmlFor="blog_description">Blog Description *</Label>
              <div className="border rounded-md">
                {/* <CKEditor
                  editor={ClassicEditor}
                  data={formData.blog_description}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    handleInputChange('blog_description', data);
                  }}
                  config={{
                    toolbar: [
                      'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 
                      'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo'
                    ],
                  }}
                /> */}
                 <CKEditor
              initData=""
              config={{
                versionCheck: false,
              }}
              value={formData.blog_description}
              onChange={(event) => {
                const data = event.editor.getData();
                handleInputChange('blog_description', data);
              }}
            //   onChange={(event) => {
            //     console.log(event);
            //     onInputChange("template_design", event.editor.getData());
            //   }}
            />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Blog Banner Image */}
            <div className="">
              <Label htmlFor="blog_banner_image">Banner Image</Label>
              <div className="">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Banner preview" 
                      className="h-20 w-auto rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={removeBannerImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <Label 
                      htmlFor="banner-upload" 
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Click to upload banner image
                    </Label>
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 ">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
<div>
            {/* Blog Categories */}
            <div className="">
              <Label>Blog Categories</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        availableCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.category_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={addCategory}
                    disabled={!selectedCategory}
                  >
                    Add
                  </Button>
                </div>
                
              

                {formData.blog_categories_ids.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {formData.blog_categories_ids.map(categoryId => {
                                      const category = availableCategories.find(cat => cat.id.toString() === categoryId);
                                      return (
                                        <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                                          {category?.category_name || categoryId}
                                          <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => removeCategory(categoryId)}
                                          />
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
              </div>
            </div>

            {/* Number */}
            <div className="">
              <Label htmlFor="blog_front">Blog Front</Label>
              <Input
                id="blog_front"
                type="number"
                value={formData.blog_front}
                onChange={(e) => handleInputChange('blog_front', e.target.value)}
                placeholder="Enter number"
              />
            </div>


            </div>
            </div>
            {/* Toggle Switches */}
            <div className="grid grid-cols-1 gap-6">
              {/* Blog Front */}
              {/* <div className="flex items-center justify-between">
                <Label htmlFor="blog_front" className="flex flex-col space-y-1">
                  <span>Show on Front</span>
                  <span className="text-sm text-gray-500">Display this blog on front page</span>
                </Label>
                <Switch
                  id="blog_front"
                  checked={formData.blog_front === 'Yes'}
                  onCheckedChange={(checked) => 
                    handleInputChange('blog_front', checked ? 'Yes' : 'No')
                  }
                />
              </div> */}

              {/* Blog Featured */}
              <div className="flex items-center justify-between">
                <Label htmlFor="blog_featured" className="flex flex-col space-y-1">
                  <span>Featured Blog</span>
                  <span className="text-sm text-gray-500">Mark as featured blog</span>
                </Label>
                <Switch
                  id="blog_featured"
                  checked={formData.blog_featured === 'Yes'}
                  onCheckedChange={(checked) => 
                    handleInputChange('blog_featured', checked ? 'Yes' : 'No')
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={createBlogMutation.isLoading}
                className="min-w-32"
              >
                {createBlogMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Blog'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/blog')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCreate;