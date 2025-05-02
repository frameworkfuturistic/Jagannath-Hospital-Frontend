'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BlogForm } from './blog-form';
import type { Blog } from './blog';

interface BlogFormDialogProps {
  mode: 'create' | 'edit';
  blog?: Blog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Blog>) => Promise<void>;
}

export function BlogFormDialog({
  mode,
  blog,
  isOpen,
  onOpenChange,
  onSubmit,
}: BlogFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Blog>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            {mode === 'create' ? 'Create New Blog' : 'Edit Blog'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <BlogForm
            initialData={blog}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
