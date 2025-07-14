'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimetableStore } from '@/store/timetableStore';
import type { TimetableBlock } from '@/types';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

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

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  type: z.enum(['recurring', 'one-time']),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  date: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
}).refine(
  (data) => {
    if (data.type === 'recurring' && data.startTime && data.endTime) {
      return data.startTime < data.endTime;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
).refine(
  (data) => {
    if (data.type === 'one-time') {
      return data.date && data.date.length > 0;
    }
    return true;
  },
  {
    message: "Date is required for one-time events",
    path: ["date"],
  }
).refine(
  (data) => {
    if (data.type === 'recurring') {
      return data.day && data.day.length > 0;
    }
    return true;
  },
  {
    message: "Day is required for recurring events",
    path: ["day"],
  }
);

type EventFormData = z.infer<typeof eventSchema>;

interface EventDialogProps {
  editingBlock?: TimetableBlock | null;
  onEditingChange?: (block: TimetableBlock | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EventDialog({ editingBlock, onEditingChange, isOpen, onOpenChange }: EventDialogProps) {
  const { addBlock, updateBlock } = useTimetableStore();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: editingBlock?.title || '',
      description: editingBlock?.description || '',
      type: (editingBlock?.type === 'assignment' ? 'one-time' : editingBlock?.type) || 'recurring',
      day: editingBlock?.day || 'monday',
      startTime: editingBlock?.startTime || 'none',
      endTime: editingBlock?.endTime || 'none',
      date: editingBlock?.date ? 
        (editingBlock.date instanceof Date ? 
          editingBlock.date.toISOString().split('T')[0] : 
          new Date(editingBlock.date).toISOString().split('T')[0]
        ) : '',
      color: editingBlock?.color || COLORS[0].value,
    },
  });

  const watchType = form.watch('type');

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const onSubmit = (data: EventFormData) => {
    const blockData: Omit<TimetableBlock, 'id' | 'createdAt'> = {
      title: data.title,
      description: data.description || undefined,
      day: data.day || 'monday',
      startTime: data.startTime && data.startTime !== 'none' ? data.startTime : undefined,
      endTime: data.endTime && data.endTime !== 'none' ? data.endTime : undefined,
      color: data.color,
      type: data.type,
      ...(data.type === 'one-time' && data.date ? { date: new Date(data.date) } : {}),
    };

    if (editingBlock) {
      updateBlock(editingBlock.id, blockData);
    } else {
      addBlock(blockData);
    }

    resetForm();
    onOpenChange?.(false);
  };

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      type: 'recurring',
      day: 'monday',
      startTime: 'none',
      endTime: 'none',
      date: '',
      color: COLORS[0].value,
    });
    onEditingChange?.(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="gap-2"
          onClick={resetForm}
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBlock ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {editingBlock ? 'Update your event details' : 'Add a new event to your timetable'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField<EventFormData>
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField<EventFormData>
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField<EventFormData>
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recurring">Recurring (Weekly)</SelectItem>
                        <SelectItem value="one-time">One-time Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchType === 'recurring' ? (
              <div className="grid grid-cols-3 gap-4">
                <FormField<EventFormData>
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day.key} value={day.key}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField<EventFormData>
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField<EventFormData>
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField<EventFormData>
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField<EventFormData>
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
                {editingBlock ? 'Update Event' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
