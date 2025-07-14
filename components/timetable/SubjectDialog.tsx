'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTimetableStore } from '@/store/timetableStore';
import type { Subject } from '@/types';

const COLORS = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Green', value: '#10b981', bg: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Orange', value: '#f59e0b', bg: 'bg-orange-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
];

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100, 'Subject name is too long'),
  code: z.string().min(1, 'Subject code is required').max(20, 'Subject code is too long'),
  instructor: z.string().max(100, 'Instructor name is too long').optional(),
  credits: z.number().min(0).max(20).optional(),
  color: z.string().min(1, 'Color is required'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectDialogProps {
  editingSubject?: Subject | null;
  onEditingChange?: (subject: Subject | null) => void;
}

export function SubjectDialog({ editingSubject, onEditingChange }: SubjectDialogProps) {
  const { addSubject, updateSubject } = useTimetableStore();
  const [open, setOpen] = useState(false);

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: editingSubject?.name || '',
      code: editingSubject?.code || '',
      instructor: editingSubject?.instructor || '',
      credits: editingSubject?.credits || undefined,
      color: editingSubject?.color || COLORS[0].value,
    },
  });

  // Open dialog when editingSubject changes
  useEffect(() => {
    if (editingSubject) {
      setOpen(true);
      form.reset({
        name: editingSubject.name,
        code: editingSubject.code,
        instructor: editingSubject.instructor || '',
        credits: editingSubject.credits || undefined,
        color: editingSubject.color,
      });
    }
  }, [editingSubject, form]);

  const onSubmit = (data: SubjectFormData) => {
    const subjectData: Omit<Subject, 'id' | 'createdAt'> = {
      name: data.name,
      code: data.code,
      instructor: data.instructor || undefined,
      credits: data.credits || undefined,
      color: data.color,
    };

    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
    } else {
      addSubject(subjectData);
    }

    form.reset();
    setOpen(false);
    onEditingChange?.(null);
  };

  const resetForm = () => {
    form.reset({
      name: '',
      code: '',
      instructor: '',
      credits: undefined,
      color: COLORS[0].value,
    });
    setOpen(false);
    onEditingChange?.(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onEditingChange?.(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          <DialogDescription>
            {editingSubject ? 'Update subject details' : 'Create a new subject for your curriculum'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mathematics"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., MATH101"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Instructor name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 mt-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={`w-6 h-6 rounded-full ${color.bg} ${
                            field.value === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
