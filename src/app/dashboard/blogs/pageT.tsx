// eslint-disable-next-line
// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useMemo,
} from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { format } from 'date-fns';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import {
  AlertCircle,
  Calendar,
  Edit3,
  Eye,
  FileText,
  Plus,
  Tag,
  Trash2,
  User,
  Upload,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Image as ImageIcon,
  Search,
  MoreVertical,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';

// Constants
const CATEGORIES = [
  'wellness',
  'nutrition',
  'fitness',
  'mental-health',
  'medical-research',
  'healthcare-technology',
] as const;

// Types
type BlogStatus = 'draft' | 'published';

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  blogImageUrl?: string | File;
  readTime?: number;
  publishDate: string;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}

interface ApiResponse<T> {
  blogs: T;
  success: boolean;
  data: T;
  message?: string;
}

type SortConfig = {
  key: keyof Blog;
  direction: 'asc' | 'desc';
};

// Components
const CustomBadge: React.FC<{ status: BlogStatus }> = ({ status }) => {
  const variant = status === 'published' ? 'default' : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
};

const BlogForm: React.FC<{
  mode: 'create' | 'edit' | 'view';
  initialData?: Partial<Blog>;
  onSubmit: (data: Partial<Blog>) => Promise<void>;
  onCancel: () => void;
}> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Blog>>(
    initialData || {
      title: '',
      content: '',
      author: '',
      category: '',
      tags: [],
      status: 'draft',
      blogImageUrl: '',
      publishDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === 'view'
            ? 'View Blog'
            : mode === 'edit'
            ? 'Edit Blog'
            : 'Create New Blog'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'view'
            ? 'View the details of this blog post.'
            : mode === 'edit'
            ? 'Make changes to your blog post here.'
            : 'Fill in the details for your new blog post.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="col-span-3"
              disabled={mode === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <ReactQuill
              id="content"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              className="col-span-3"
              readOnly={mode === 'view'}
              theme="snow"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right">
              Author
            </Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="col-span-3"
              disabled={mode === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              disabled={mode === 'view'}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags?.join(', ')}
              onChange={handleTagsChange}
              className="col-span-3"
              disabled={mode === 'view'}
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value: BlogStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
              disabled={mode === 'view'}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3">
              {mode !== 'view' ? (
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              ) : (
                formData.blogImageUrl && (
                  <Image
                    src={formData.blogImageUrl as string}
                    alt="Blog post image"
                    width={500}
                    height={300}
                    className="max-w-full h-auto rounded-lg"
                  />
                )
              )}
              {mode === 'edit' && typeof formData.blogImageUrl === 'string' && (
                <div className="mt-2">
                  <Image
                    src={formData.blogImageUrl}
                    alt="Current blog image"
                    width={200}
                    height={120}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="publishDate" className="text-right">
              Publish Date
            </Label>
            <Input
              id="publishDate"
              name="publishDate"
              type="datetime-local"
              value={
                formData.publishDate
                  ? format(new Date(formData.publishDate), "yyyy-MM-dd'T'HH:mm")
                  : ''
              }
              onChange={handleChange}
              className="col-span-3"
              disabled={mode === 'view'}
            />
          </div>
        </div>
        <DialogFooter>
          {mode !== 'view' && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{mode === 'edit' ? 'Update Blog' : 'Create Blog'}</>
              )}
            </Button>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const BlogList: React.FC<{
  blogs: Blog[];
  onView: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
}> = ({ blogs, onView, onEdit, onDelete }) => {
  return (
    <Reorder.Group axis="y" values={blogs} onReorder={() => {}}>
      <AnimatePresence>
        {blogs.map((blog) => (
          <Reorder.Item key={blog._id} value={blog}>
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-start space-x-4 w-full sm:w-auto">
                  {blog.blogImageUrl ? (
                    <Image
                      src={blog.blogImageUrl as string}
                      alt={blog.title}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {blog.author}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <CustomBadge status={blog.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(blog.publishDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(blog)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(blog)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(blog._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};

const StatsCard: React.FC<{ blogs: Blog[] }> = ({ blogs }) => {
  return (
    <Card className="">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <p className="text-base font-medium text-blue-600 dark:text-blue-300">
              Total Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-blue-700 dark:text-blue-200">
              {blogs.length}
            </p>
            <Progress value={(blogs.length / 100) * 100} className="mt-2" />
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-base font-medium text-green-600 dark:text-green-300">
              Published Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-green-700 dark:text-green-200">
              {blogs.filter((blog) => blog.status === 'published').length}
            </p>
            <Progress
              value={
                (blogs.filter((blog) => blog.status === 'published').length /
                  blogs.length) *
                100
              }
              className="mt-2"
            />
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <p className="text-base font-medium text-yellow-600 dark:text-yellow-300">
              Draft Blogs
            </p>
            <p className="text-3xl font-bold mt-2 text-yellow-700 dark:text-yellow-200">
              {blogs.filter((blog) => blog.status === 'draft').length}
            </p>
            <Progress
              value={
                (blogs.filter((blog) => blog.status === 'draft').length /
                  blogs.length) *
                100
              }
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdvancedBlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'publishDate',
    direction: 'desc',
  });
  const [isPending, startTransition] = useTransition();
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<ApiResponse<Blog[]>>('/blogs');

      if (response.data?.data?.blogs?.length > 0) {
        const formattedBlogs = response.data?.data.blogs.map((blog) => ({
          ...blog,
        }));

        setBlogs(formattedBlogs);
      } else {
        throw new Error('No blogs found');
      }
    } catch (error: any) {
      console.error(
        'Error fetching blogs:',
        error.response?.data || error.message
      );
      setError('Failed to fetch blogs. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCreateBlog = useCallback(
    async (newBlog: Omit<Blog, '_id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
      try {
        const formData = new FormData();
        Object.entries(newBlog).forEach(([key, value]) => {
          if (key === 'tags') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });

        const response = await axiosInstance.post<ApiResponse<Blog>>(
          '/blogs',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        if (response.data?.data?.success && response.data?.data) {
          const newBlogWithFormattedImage = {
            ...response.data.data,
            image: response.data.data.blogImageUrl,
          };
          setBlogs((prevBlogs) => [...prevBlogs, newBlogWithFormattedImage]);
          setIsCreateDialogOpen(false);
          toast({
            title: 'Success',
            description: 'Your new blog post has been created successfully.',
          });
        } else {
          setError(response.data?.message || 'Failed to create blog');
          toast({
            title: 'Error',
            description:
              response.data?.message ||
              'Failed to create blog post. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        console.error('Error creating blog:', error);
        setError('Failed to create blog post.');
        toast({
          title: 'Error',
          description: 'Failed to create blog post. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const handleUpdateBlog = useCallback(
    async (updatedBlog: Blog) => {
      try {
        const formData = new FormData();
        Object.entries(updatedBlog).forEach(([key, value]) => {
          if (key === 'tags') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'image') {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (typeof value === 'string' && value.startsWith('http')) {
              // Skip adding URL-based image
            } else {
              formData.append(key, String(value));
            }
          } else {
            formData.append(key, String(value));
          }
        });

        const response = await axiosInstance.put<ApiResponse<Blog>>(
          `/blogs/${updatedBlog._id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        console.log('Response:', response.data);
        if (response.data?.data?.success && response.data?.data) {
          const updatedBlogWithFormattedImage = {
            ...response.data?.data.data,
            image: response.data?.data.data.blogImageUrl,
          };
          setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
              blog._id === updatedBlog._id
                ? updatedBlogWithFormattedImage
                : blog
            )
          );
          setIsEditDialogOpen(false);
          toast({
            title: 'Success',
            description: 'Your blog post has been updated successfully.',
          });
        } else {
          throw new Error(response.data?.message || 'Failed to update blog');
        }
      } catch (error: any) {
        console.error('Error updating blog:', error);
        setError('Failed to update blog post.');
        toast({
          title: 'Error',
          description:
            error.message || 'Failed to update blog post. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const handleDeleteBlog = useCallback(
    async (blogId: string) => {
      try {
        const response = await axiosInstance.delete<ApiResponse<null>>(
          `/blogs/${blogId}`
        );
        if (response.status === 200 && response.data.success) {
          setBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog._id !== blogId)
          );
          toast({
            title: 'Success',
            description: 'Your blog post has been deleted successfully.',
          });
        } else {
          throw new Error('Failed to delete blog');
        }
      } catch (error: any) {
        console.error('Error deleting blog:', error);
        setError('Failed to delete blog post.');
        toast({
          title: 'Error',
          description: 'Failed to delete blog post. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (currentTab !== 'all') {
      filtered = filtered.filter((blog) => blog.status === currentTab);
    }

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [blogs, searchTerm, currentTab, sortConfig]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-hidden flex flex-col ">
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        <div className="">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatsCard blogs={blogs} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => startTransition(() => fetchBlogs())}
                      disabled={isPending}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          isPending ? 'animate-spin' : ''
                        }`}
                      />
                      Refresh
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 max-w-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Blog
                  </Button>
                </div>
                <Tabs
                  value={currentTab}
                  onValueChange={setCurrentTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="all">All Blogs</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <BlogList
                      blogs={filteredAndSortedBlogs}
                      onView={(blog) => {
                        setSelectedBlog(blog);
                        setIsViewDialogOpen(true);
                      }}
                      onEdit={(blog) => {
                        setSelectedBlog(blog);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={handleDeleteBlog}
                    />
                  </TabsContent>
                  <TabsContent value="published">
                    <BlogList
                      blogs={filteredAndSortedBlogs.filter(
                        (blog) => blog.status === 'published'
                      )}
                      onView={(blog) => {
                        setSelectedBlog(blog);
                        setIsViewDialogOpen(true);
                      }}
                      onEdit={(blog) => {
                        setSelectedBlog(blog);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={handleDeleteBlog}
                    />
                  </TabsContent>
                  <TabsContent value="draft">
                    <BlogList
                      blogs={filteredAndSortedBlogs.filter(
                        (blog) => blog.status === 'draft'
                      )}
                      onView={(blog) => {
                        setSelectedBlog(blog);
                        setIsViewDialogOpen(true);
                      }}
                      onEdit={(blog) => {
                        setSelectedBlog(blog);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={handleDeleteBlog}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <BlogForm
              mode="view"
              initialData={selectedBlog || undefined}
              onSubmit={() => {}}
              onCancel={() => setIsViewDialogOpen(false)}
            />
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <BlogForm
              mode="edit"
              initialData={selectedBlog || undefined}
              onSubmit={async (data) => {
                if (selectedBlog) {
                  await handleUpdateBlog({ ...selectedBlog, ...data } as Blog);
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <BlogForm
              mode="create"
              onSubmit={handleCreateBlog}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
