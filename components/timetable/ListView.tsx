'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Search,
  Edit,
  Trash2,
  CalendarDays,
  MapPin
} from 'lucide-react';
import { useTimetableStore } from '@/store/timetableStore';
import type { TimetableBlock } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ListViewProps {
  onEditBlock: (block: TimetableBlock) => void;
  onEditAssignment?: (assignmentId: string) => void;
}

export function ListView({ onEditBlock, onEditAssignment }: ListViewProps) {
  const { blocks, deleteBlock, assignments, subjects } = useTimetableStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'time' | 'day' | 'date'>('date');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  // Convert assignments to block-like format for unified display
  const assignmentBlocks = useMemo(() => {
    return assignments.map(assignment => {
      const subject = subjects.find(s => s.id === assignment.subjectId);
      const dueDate = assignment.dueDate instanceof Date ? assignment.dueDate : new Date(assignment.dueDate);
      
      return {
        id: assignment.id,
        title: `📝 ${assignment.title}`,
        description: `${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)} - ${subject?.name || 'Unknown Subject'}${assignment.description ? ` | ${assignment.description}` : ''}`,
        startTime: undefined,
        endTime: undefined,
        day: 'monday' as const, // This won't be used for filtering
        color: subject?.color || '#6b7280',
        type: 'assignment' as const,
        createdAt: assignment.createdAt,
        date: dueDate,
        dueDate: assignment.dueDate,
        priority: assignment.priority,
        status: assignment.status,
        assignmentId: assignment.id
      };
    });
  }, [assignments, subjects]);

  const handleEditEvent = (event: TimetableBlock) => {
    if (event.type === 'assignment' && event.assignmentId && onEditAssignment) {
      onEditAssignment(event.assignmentId);
    } else {
      onEditBlock(event);
    }
  };

  const filteredAndSortedBlocks = useMemo(() => {
    // Combine blocks and assignment blocks
    const allBlocks = [...blocks, ...assignmentBlocks];
    
    const filtered = allBlocks.filter(block => {
      const matchesSearch = block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           block.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || block.type === filterType;
      const matchesDay = filterDay === 'all' || block.day === filterDay || block.type === 'assignment';
      
      return matchesSearch && matchesType && matchesDay;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'time': {
          const aTime = a.startTime || '00:00';
          const bTime = b.startTime || '00:00';
          return aTime.localeCompare(bTime);
        }
        case 'day': {
          const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        }
        case 'date':
        default:
          // Sort by date for one-time events, then by day for recurring
          if (a.type === 'one-time' && b.type === 'one-time') {
            const aDate = a.date ? new Date(a.date) : new Date();
            const bDate = b.date ? new Date(b.date) : new Date();
            return aDate.getTime() - bDate.getTime();
          } else if (a.type === 'one-time') {
            return -1; // One-time events first
          } else if (b.type === 'one-time') {
            return 1;
          } else {
            // Both recurring, sort by day
            const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
          }
      }
    });
  }, [blocks, assignmentBlocks, searchTerm, filterType, filterDay, sortBy]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const handleDelete = (blockId: string) => {
    setBlockToDelete(blockId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (blockToDelete) {
      deleteBlock(blockToDelete);
      setBlockToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setBlockToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event List</h2>
          <p className="text-muted-foreground">
            View and manage all your events in a list format
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date/Day</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="day">Day of Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{filteredAndSortedBlocks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recurring</p>
                <p className="text-2xl font-bold text-green-500">
                  {filteredAndSortedBlocks.filter(b => b.type === 'recurring').length}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">One-time</p>
                <p className="text-2xl font-bold text-purple-500">
                  {filteredAndSortedBlocks.filter(b => b.type === 'one-time').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {filteredAndSortedBlocks.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No events found</h3>
              <p className="text-sm">
                {blocks.length === 0 
                  ? "Start by adding your first event"
                  : "Try adjusting your filters or search criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Color Indicator */}
                    <div 
                      className="w-1 h-16 rounded-full flex-shrink-0"
                      style={{ backgroundColor: block.color }}
                    />
                    
                    {/* Event Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{block.title}</h3>
                          {block.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {block.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {block.type === 'recurring' ? 'Recurring' : 'One-time'}
                            </Badge>
                            
                            {block.type === 'recurring' ? (
                              <Badge variant="secondary" className="text-xs">
                                Every {formatDay(block.day)}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {block.date ? formatDate(block.date) : 'No date'}
                              </Badge>
                            )}
                            
                            <Badge variant="secondary" className="text-xs">
                              {block.startTime && block.endTime 
                                ? `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
                                : block.startTime 
                                  ? `${formatTime(block.startTime)}`
                                  : 'All day'
                              }
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEvent(block)}
                            className="text-xs px-3"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(block.id)}
                            className="text-xs px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
