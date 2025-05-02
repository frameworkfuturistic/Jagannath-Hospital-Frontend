'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Blog } from './blog';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Constants
const CATEGORIES = [
  'wellness',
  'nutrition',
  'fitness',
  'mental-health',
  'medical-research',
  'healthcare-technology',
] as const;

interface BlogFormProps {
  initialData?: Blog | null;
  onSubmit: (data: Partial<Blog>) => Promise<void>;
  isSubmitting?: boolean;
}

export function BlogForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: BlogFormProps) {
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

  // Initialize ReactQuill
  const [quillLoaded, setQuillLoaded] = useState(false);
  useEffect(() => {
    setQuillLoaded(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, blogImageUrl: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value: 'draft' | 'published') =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags?.join(', ')}
            onChange={handleTagsChange}
            placeholder="Enter comma-separated tags"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishDate">Publish Date</Label>
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
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image">Featured Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          {typeof formData.blogImageUrl === 'string' &&
            formData.blogImageUrl && (
              <p className="text-sm text-muted-foreground mt-2">
                Current image: {formData.blogImageUrl.split('/').pop()}
              </p>
            )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        {quillLoaded && (
          <ReactQuill
            id="content"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            className="min-h-[200px]"
            theme="snow"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
          />
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Blog'
          ) : (
            'Create Blog'
          )}
        </Button>
      </div>
    </form>
  );
}
