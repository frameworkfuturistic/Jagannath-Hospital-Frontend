'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Blog } from './blog';

interface BlogViewDialogProps {
  blog: Blog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlogViewDialog({
  blog,
  isOpen,
  onOpenChange,
}: BlogViewDialogProps) {
  if (!blog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">{blog.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {blog.blogImageUrl && (
            <div className="relative w-full h-[250px] rounded-md overflow-hidden">
              <Image
                src={(blog.blogImageUrl as string) || '/placeholder.svg'}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant={blog.status === 'published' ? 'default' : 'secondary'}
            >
              {blog.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(blog.publishDate), 'MMMM dd, yyyy')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Author
              </h3>
              <p>{blog.author}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Category
              </h3>
              <p className="capitalize">{blog.category.replace('-', ' ')}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Content
            </h3>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
