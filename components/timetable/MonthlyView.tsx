'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit3, Trash2, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimetableStore } from '@/store/timetableStore';
import type { TimetableBlock } from '@/types';

interface MonthlyViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEditBlock: (block: TimetableBlock) => void;
  onEditAssignment?: (assignmentId: string) => void;
}

export function MonthlyView({ currentDate, onDateChange, onEditBlock, onEditAssignment }: MonthlyViewProps) {
  const { getBlocksForMonth, assignments, subjects, deleteBlock } = useTimetableStore();
  
  const [todayDate, setTodayDate] = useState<Date | null>(null);
  
  // Set today's date only on the client to avoid hydration mismatch
  useEffect(() => {
    setTodayDate(new Date());
  }, []);
  
  const monthBlocks = getBlocksForMonth(currentDate.getMonth(), currentDate.getFullYear());

  const getCalendarDays = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = start.getDay();
    const daysInMonth = end.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getDayEvents = (day: number) => {
    return monthBlocks.filter(block => {
      if (!block.date) return false;
      // Handle both Date objects and date strings
      const blockDate = block.date instanceof Date ? block.date : new Date(block.date);
      return blockDate.getDate() === day;
    });
  };

  const getDayAssignments = (day: number) => {
    return assignments.filter(assignment => {
      const dueDate = assignment.dueDate instanceof Date ? assignment.dueDate : new Date(assignment.dueDate);
      return dueDate.getMonth() === currentDate.getMonth() && 
             dueDate.getFullYear() === currentDate.getFullYear() &&
             dueDate.getDate() === day;
    });
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#3b82f6';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const goToPreviousMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleKeyDown = (event: React.KeyboardEvent, day: number) => {
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (day > 1) {
          // Focus previous day
          const prevDay = day - 1;
          const nextElement = document.querySelector(`[data-day="${prevDay}"]`) as HTMLElement;
          nextElement?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Focus next day if it exists
        if (day < daysInCurrentMonth) {
          const nextDay = day + 1;
          const nextElement = document.querySelector(`[data-day="${nextDay}"]`) as HTMLElement;
          nextElement?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (day > 7) {
          const prevWeekDay = day - 7;
          const nextElement = document.querySelector(`[data-day="${prevWeekDay}"]`) as HTMLElement;
          nextElement?.focus();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (day + 7 <= daysInCurrentMonth) {
          const nextWeekDay = day + 7;
          const nextElement = document.querySelector(`[data-day="${nextWeekDay}"]`) as HTMLElement;
          nextElement?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Could trigger day selection or add event functionality
        break;
    }
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            aria-label="Go to previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            aria-label="Go to today"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            aria-label="Go to next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Header with day names */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-medium text-sm bg-muted/50">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div 
            className="grid grid-cols-7"
            role="grid"
            aria-label={`Calendar for ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          >
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className="min-h-[120px] p-2 border-r border-b border-border/50 bg-muted/20"
                  />
                );
              }
              
              const events = getDayEvents(day);
              const dayAssignments = getDayAssignments(day);
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = todayDate ? todayDate.toDateString() === dayDate.toDateString() : false;
              const isWeekend = (index % 7 === 0) || (index % 7 === 6);
              
              return (
                <motion.div
                  key={`day-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  role="gridcell"
                  tabIndex={0}
                  data-day={day}
                  aria-label={`${day} ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}${isToday ? ', today' : ''}, ${events.length + dayAssignments.length} events`}
                  onKeyDown={(e) => handleKeyDown(e, day)}
                  className={`min-h-[120px] p-2 border-r border-b border-border/50 hover:bg-accent/50 focus:bg-accent/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer ${
                    isToday ? 'bg-primary/10 ring-1 ring-primary' : ''
                  } ${
                    isWeekend ? 'bg-muted/20' : ''
                  }`}
                >
                  {/* Day number */}
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-primary font-bold' : ''
                  }`}>
                    {day}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="group relative"
                        role="button"
                        tabIndex={0}
                        aria-label={`Event: ${event.title}${event.startTime && event.endTime ? ` from ${formatTime(event.startTime)} to ${formatTime(event.endTime)}` : event.startTime ? ` at ${formatTime(event.startTime)}` : ' all day'}. Click to edit.`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEditBlock(event);
                          }
                        }}
                      >
                        <div
                          className="text-xs p-1.5 rounded text-white truncate cursor-pointer hover:shadow-sm transition-shadow"
                          style={{ backgroundColor: event.color }}
                          onClick={() => onEditBlock(event)}
                          title={`${event.title}${event.startTime && event.endTime ? ` (${formatTime(event.startTime)} - ${formatTime(event.endTime)})` : event.startTime ? ` (${formatTime(event.startTime)})` : ''}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 opacity-75" />
                            <span className="truncate">{event.title}</span>
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
                                onEditBlock(event);
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
                                deleteBlock(event.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                            >
                              <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Assignments */}
                    {dayAssignments.slice(0, Math.max(0, 3 - events.length)).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="group relative"
                        role="button"
                        tabIndex={0}
                        aria-label={`Assignment: ${assignment.title} for ${getSubjectName(assignment.subjectId)}, ${assignment.status}, ${assignment.priority} priority. Due today. Click to edit.`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEditAssignment?.(assignment.id);
                          }
                        }}
                      >
                        <div
                          className="text-xs p-1.5 rounded text-white truncate cursor-pointer hover:shadow-sm transition-shadow border-l-2 border-l-white/50"
                          style={{ backgroundColor: getSubjectColor(assignment.subjectId) }}
                          title={`${assignment.title} - ${getSubjectName(assignment.subjectId)} (Due) - ${assignment.status} priority: ${assignment.priority}`}
                          onClick={() => onEditAssignment?.(assignment.id)}
                        >
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 opacity-75" />
                            <span className="truncate">{assignment.title}</span>
                            {assignment.priority === 'high' && (
                              <div className="w-2 h-2 rounded-full bg-red-400" title="High Priority" />
                            )}
                            {assignment.status === 'submitted' && (
                              <div className="w-2 h-2 rounded-full bg-green-400" title="Submitted" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* More items indicator */}
                    {(events.length + dayAssignments.length) > 3 && (
                      <div className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        +{(events.length + dayAssignments.length) - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{monthBlocks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-500">
                  {monthBlocks.filter(b => b.type === 'recurring').length}
                </p>
                <p className="text-xs text-muted-foreground">Recurring</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {monthBlocks.filter(b => b.type === 'one-time').length} One-time
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Busy Days</p>
                <p className="text-2xl font-bold text-green-500">
                  {Array.from(new Set(monthBlocks.map(b => {
                    if (!b.date) return null;
                    const date = typeof b.date === 'string' ? new Date(b.date) : b.date;
                    return date.getDate();
                  }).filter(Boolean))).length}
                </p>
              </div>
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
