'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

import { BlogTable } from './blog-table';
import { BlogStats } from './blog-stats';
import { BlogViewDialog } from './blog-view-dialog';
import { BlogFormDialog } from './blog-form-dialog';
import { getBlogs, createBlog, updateBlog, deleteBlog } from './blog-service';
import type { Blog } from './blog';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const fetchedBlogs = await getBlogs();
      setBlogs(fetchedBlogs);
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsViewDialogOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await deleteBlog(blogId);
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBlog = async (blogData: Partial<Blog>) => {
    try {
      const newBlog = await createBlog(blogData);
      setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Blog post created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBlog = async (blogData: Partial<Blog>) => {
    if (!selectedBlog) return;

    try {
      const updatedBlog = await updateBlog(selectedBlog._id, blogData);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === selectedBlog._id ? { ...blog, ...updatedBlog } : blog
        )
      );
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Blog post updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update blog post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredBlogs = blogs
    .filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((blog) => {
      if (currentTab === 'all') return true;
      return blog.status === currentTab;
    });

  return (
    <div className="space-y-6">
      <BlogStats blogs={blogs} />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBlogs}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>
          </div>

          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Blogs</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <BlogTable
                blogs={filteredBlogs}
                isLoading={isLoading}
                onView={handleViewBlog}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
              />
            </TabsContent>

            <TabsContent value="published" className="mt-0">
              <BlogTable
                blogs={filteredBlogs}
                isLoading={isLoading}
                onView={handleViewBlog}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
              />
            </TabsContent>

            <TabsContent value="draft" className="mt-0">
              <BlogTable
                blogs={filteredBlogs}
                isLoading={isLoading}
                onView={handleViewBlog}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* View Dialog */}
      <BlogViewDialog
        blog={selectedBlog}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
      {/* Create Dialog */}
      <BlogFormDialog
        mode="create"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateBlog}
      />
      {/* Edit Dialog */}
      <BlogFormDialog
        mode="edit"
        blog={selectedBlog}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateBlog}
      />
    </div>
  );
}
