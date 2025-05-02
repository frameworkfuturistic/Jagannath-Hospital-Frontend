'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import axiosInstance from '@/lib/axiosInstance';

// Define types
interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  GalleryImageUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface FormData {
  title: string;
  description: string;
  createdBy: string;
}

export default function GalleryDashboard() {
  // State management
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GalleryImage;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch images function
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/gallery');
      setImages(response.data?.data?.images);
      setError(null);
    } catch (err) {
      setError('Failed to fetch images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('createdBy', data.createdBy);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    setLoading(true);

    try {
      if (editingImage) {
        await axiosInstance.put(`/gallery/${editingImage._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMessage('Image updated successfully');
      } else {
        await axiosInstance.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMessage('Image added successfully');
      }

      fetchImages();
      setIsDialogOpen(false);
      reset();
      setImageFile(null);
    } catch (err) {
      setError('Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  // Delete image handler
  const deleteImage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/gallery/${id}`);
        setSuccessMessage('Image deleted successfully');
        fetchImages();
      } catch (err) {
        setError('Failed to delete image');
      } finally {
        setLoading(false);
      }
    }
  };

  // Dialog open handler
  const openDialog = useCallback(
    (image?: GalleryImage) => {
      if (image) {
        setEditingImage(image);
        reset({
          title: image.title,
          description: image.description,
          createdBy: image.createdBy,
        });
      } else {
        setEditingImage(null);
        reset();
      }
      setIsDialogOpen(true);
    },
    [reset]
  );

  // Sort handler
  const handleSort = useCallback((key: keyof GalleryImage) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig?.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  }, []);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 5242880, // 5MB
  });

  // Memoized filtered and sorted images
  const filteredImages = useMemo(() => {
    return images
      .filter(
        (image) =>
          image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [images, searchTerm, sortConfig]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-3 md:p-6 space-y-4">
        <div className="  overflow-hidden">
          <div className="p-4">
            {/* Header with search and add button */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={() => openDialog()}
                size="sm"
                className="ml-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> New Image
              </Button>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert
                variant="default"
                className="mb-4 bg-green-50 text-green-800 border-green-300"
              >
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Loading state or gallery grid */}
            {loading && images.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {filteredImages.map((image) => (
                    <motion.div
                      key={image._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <Card className="h-full flex flex-col">
                        <CardContent className="p-3 flex flex-col h-full">
                          <div className="relative aspect-video mb-3 overflow-hidden rounded-md">
                            <Image
                              src={
                                image.GalleryImageUrl || '/default-image.jpg'
                              }
                              alt={image.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              className="object-cover"
                              priority={false}
                              unoptimized={
                                process.env.NODE_ENV !== 'production'
                              }
                            />
                          </div>

                          <h3 className="text-base font-semibold text-primary mb-1 line-clamp-1">
                            {image.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">
                            {image.description}
                          </p>
                          <div className="flex justify-between items-center mt-auto">
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {image.createdBy}
                            </p>
                            <div className="flex space-x-1">
                              <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openDialog(image)}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                      <span className="sr-only">
                                        Edit image
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit image</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                      onClick={() => deleteImage(image._id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span className="sr-only">
                                        Delete image
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete image</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredImages.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No images found. Try adjusting your search or add a new
                    image.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="title"
                    className="text-right text-sm font-medium"
                  >
                    Title
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <label
                    htmlFor="description"
                    className="text-right text-sm font-medium pt-2"
                  >
                    Description
                  </label>
                  <div className="col-span-3">
                    <Textarea
                      id="description"
                      rows={3}
                      {...register('description', {
                        required: 'Description is required',
                      })}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="text-right text-sm font-medium pt-2">
                    Image
                  </label>
                  <div className="col-span-3">
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 transition-colors hover:border-primary/50 cursor-pointer text-center"
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {imageFile
                          ? imageFile.name
                          : 'Drag an image here or click to browse'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="createdBy"
                    className="text-right text-sm font-medium"
                  >
                    Created By
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="createdBy"
                      {...register('createdBy', {
                        required: 'Creator name is required',
                      })}
                    />
                    {errors.createdBy && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.createdBy.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingImage ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
