'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Assignment } from '@/types';
import { useTimetableStore } from '@/store/timetableStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'Subject is required'),
  type: z.enum(['assignment', 'project', 'exam', 'quiz', 'presentation']),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['pending', 'in-progress', 'submitted', 'graded']),
  priority: z.enum(['low', 'medium', 'high']),
  grade: z.string().optional(),
  maxPoints: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
}

export function AssignmentDialog({ open, onOpenChange, assignment }: AssignmentDialogProps) {
  const { subjects, addAssignment, updateAssignment } = useTimetableStore();
  const isEditing = !!assignment;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      type: 'assignment',
      dueDate: '',
      status: 'pending',
      priority: 'medium',
      grade: '',
      maxPoints: '',
    },
  });

  useEffect(() => {
    if (assignment) {
      const dueDate = assignment.dueDate instanceof Date 
        ? assignment.dueDate.toISOString().split('T')[0]
        : new Date(assignment.dueDate).toISOString().split('T')[0];
      
      form.reset({
        title: assignment.title,
        description: assignment.description || '',
        subjectId: assignment.subjectId,
        type: assignment.type,
        dueDate,
        status: assignment.status,
        priority: assignment.priority,
        grade: assignment.grade || '',
        maxPoints: assignment.maxPoints?.toString() || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        subjectId: '',
        type: 'assignment',
        dueDate: '',
        status: 'pending',
        priority: 'medium',
        grade: '',
        maxPoints: '',
      });
    }
  }, [assignment, form]);

  const onSubmit = (data: AssignmentFormValues) => {
    const assignmentData = {
      title: data.title,
      description: data.description || undefined,
      subjectId: data.subjectId,
      type: data.type,
      dueDate: new Date(data.dueDate),
      status: data.status,
      priority: data.priority,
      grade: data.grade || undefined,
      maxPoints: data.maxPoints ? parseInt(data.maxPoints) : undefined,
    };

    if (isEditing && assignment) {
      updateAssignment(assignment.id, assignmentData);
    } else {
      addAssignment(assignmentData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Assignment' : 'Add New Assignment'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Assignment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Assignment description (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('status') === 'graded' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="A+, 95, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Points</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Assignment' : 'Add Assignment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
