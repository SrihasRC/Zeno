'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimetableStore } from '@/store/timetableStore';
import type { TimetableBlock } from '@/types';

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8; // Start from 8 AM
  return hour.toString().padStart(2, '0') + ':00';
});

interface WeeklyViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEditBlock: (block: TimetableBlock) => void;
  onEditAssignment?: (assignmentId: string) => void;
}

export function WeeklyView({ currentDate, onDateChange, onEditBlock, onEditAssignment }: WeeklyViewProps) {
  const { getBlocksForWeek, blocks, deleteBlock } = useTimetableStore();
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');
  
  const weekBlocks = getBlocksForWeek();

  const handleEditEvent = (event: TimetableBlock) => {
    if (event.type === 'assignment' && event.assignmentId && onEditAssignment) {
      onEditAssignment(event.assignmentId);
    } else {
      onEditBlock(event);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
    
    return DAYS.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  // Get one-time events for each day of the week
  const getOneTimeEventsForDay = (dayIndex: number) => {
    const date = weekDates[dayIndex];
    return blocks.filter(block => {
      if (block.type === 'one-time' && block.date) {
        const blockDate = block.date instanceof Date ? block.date : new Date(block.date);
        return blockDate.toDateString() === date.toDateString();
      }
      return false;
    });
  };

  // Get assignments for each day of the week
  const getAssignmentsForDay = (dayIndex: number) => {
    const { assignments, subjects } = useTimetableStore.getState();
    const date = weekDates[dayIndex];
    
    return assignments
      .filter(assignment => {
        const dueDate = assignment.dueDate instanceof Date ? assignment.dueDate : new Date(assignment.dueDate);
        return dueDate.toDateString() === date.toDateString();
      })
      .map(assignment => {
        const subject = subjects.find(s => s.id === assignment.subjectId);
        return {
          id: assignment.id,
          title: `📝 ${assignment.title}`,
          description: `${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)} - ${subject?.name || 'Unknown Subject'}${assignment.description ? ` | ${assignment.description}` : ''}`,
          startTime: undefined,
          endTime: undefined,
          day: 'monday' as const, // This won't be used since it's a one-time event
          color: subject?.color || '#6b7280',
          type: 'assignment' as const,
          createdAt: assignment.createdAt,
          dueDate: assignment.dueDate,
          priority: assignment.priority,
          status: assignment.status,
          assignmentId: assignment.id
        };
      });
  };

  // Combine recurring, one-time events, and assignments for each day
  const getAllEventsForDay = (dayKey: string, dayIndex: number) => {
    const recurringEvents = weekBlocks[dayKey as keyof typeof weekBlocks] || [];
    const oneTimeEvents = getOneTimeEventsForDay(dayIndex);
    const assignmentEvents = getAssignmentsForDay(dayIndex);
    return [...recurringEvents, ...oneTimeEvents, ...assignmentEvents].sort((a, b) => {
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const TimelineView = () => (
    <div className="space-y-4">
      {/* Time grid header */}
      <div className="grid grid-cols-8 gap-1 mb-4">
        <div className="p-2"></div> {/* Empty cell for time column */}
        {DAYS.map((day, index) => {
          const date = weekDates[index];
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div key={day.key} className={`p-2 text-center border rounded-lg ${
              isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <div className="font-medium text-sm">{day.short}</div>
              <div className="text-xs">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="border rounded-lg overflow-hidden">
        {TIME_SLOTS.map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-8 border-b border-border/50 min-h-[60px]">
            {/* Time label */}
            <div className="p-2 bg-muted/50 border-r text-xs font-medium text-center">
              {formatTime(timeSlot)}
            </div>
            
            {/* Day columns */}
            {DAYS.map((day, dayIndex) => {
              const allDayBlocks = getAllEventsForDay(day.key, dayIndex);
              const blocksInSlot = allDayBlocks.filter(block => {
                if (!block.startTime) return false; // Skip blocks without start time
                const blockHour = parseInt(block.startTime.split(':')[0]);
                const slotHour = parseInt(timeSlot.split(':')[0]);
                return blockHour === slotHour;
              });

              return (
                <div key={day.key} className="p-1 border-r border-border/50 relative">
                  {blocksInSlot.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative"
                    >
                      <div
                        className="p-2 rounded text-white cursor-pointer hover:shadow-md transition-shadow text-xs"
                        style={{ backgroundColor: block.color }}
                        onClick={() => handleEditEvent(block)}
                      >
                        <div className="font-medium truncate">{block.title}</div>
                        <div className="opacity-75 text-xs">
                          {block.startTime && block.endTime 
                            ? `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
                            : block.startTime 
                              ? `${formatTime(block.startTime)}`
                              : 'All day'
                          }
                        </div>
                      </div>
                      
                      {/* Hover actions */}
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="flex bg-white dark:bg-gray-800 rounded shadow-lg border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(block);
                            }}
                            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                          >
                            <Edit3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
      {DAYS.map((day, index) => {
        const allDayBlocks = getAllEventsForDay(day.key, index);
        const date = weekDates[index];
        const isToday = date.toDateString() === new Date().toDateString();
        
        return (
          <Card key={day.key} className={`${isToday ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm flex items-center justify-between ${
                isToday ? 'text-primary' : ''
              }`}>
                <span>{day.label}</span>
                <div className="flex flex-col items-end">
                  <Badge variant={isToday ? "default" : "secondary"} className="text-xs">
                    {allDayBlocks.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-1">
                    {date.getDate()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allDayBlocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No events</p>
                </div>
              ) : (
                allDayBlocks
                  .map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <div 
                        className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleEditEvent(block)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: block.color }}
                          />
                          <span className="text-sm font-medium truncate">{block.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {block.startTime && block.endTime 
                            ? `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
                            : block.startTime 
                              ? `${formatTime(block.startTime)}`
                              : 'All day'
                          }
                        </div>
                        {block.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {block.description}
                          </p>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(block);
                            }}
                            className="h-6 px-2"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            className="h-6 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weekly View</h2>
          <p className="text-sm text-muted-foreground">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'grid' ? <GridView /> : <TimelineView />}
    </div>
  );
}
