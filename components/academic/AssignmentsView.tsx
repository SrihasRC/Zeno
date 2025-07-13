'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Search,
  Calendar,
  Clock,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  FileText,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useTimetableStore } from '@/store/timetableStore';
import { Assignment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AssignmentDialog } from '@/components/academic/AssignmentDialog';
import Link from 'next/link';

export function AssignmentsView() {
  const { assignments, subjects, updateAssignment, deleteAssignment } = useTimetableStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#3b82f6';
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getSubjectName(assignment.subjectId).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      const matchesSubject = filterSubject === 'all' || assignment.subjectId === filterSubject;
      const matchesPriority = filterPriority === 'all' || assignment.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesSubject && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'status': {
          const statusOrder = { pending: 1, 'in-progress': 2, submitted: 3, graded: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const statusColors = {
    pending: 'text-orange-600 bg-orange-100',
    'in-progress': 'text-blue-600 bg-blue-100',
    submitted: 'text-purple-600 bg-purple-100',
    graded: 'text-green-600 bg-green-100',
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };

  const typeIcons = {
    assignment: FileText,
    project: GraduationCap,
    exam: AlertCircle,
    quiz: CheckCircle,
    presentation: Clock,
  };

  const handleStatusUpdate = (assignmentId: string, newStatus: Assignment['status']) => {
    updateAssignment(assignmentId, { status: newStatus });
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentDialog(true);
  };

  const handleDelete = (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(assignmentId);
    }
  };

  const getDateStatus = (dueDate: Date | string) => {
    const daysUntil = getDaysUntilDue(dueDate);
    const isOverdue = daysUntil < 0;
    const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
    
    return {
      isOverdue,
      isDueSoon,
      text: isOverdue ? `${Math.abs(daysUntil)} days overdue` :
            daysUntil === 0 ? 'Due today' :
            daysUntil === 1 ? 'Due tomorrow' :
            `${daysUntil} days left`,
      className: isOverdue ? 'text-red-600' :
                 isDueSoon ? 'text-orange-600' : 'text-muted-foreground'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-muted-foreground">
            Track and manage your academic assignments
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingAssignment(null);
            setShowAssignmentDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-500">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-500">
                  {assignments.filter(a => a.status === 'in-progress').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">
                  {assignments.filter(a => a.status === 'graded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-sm">
                {assignments.length === 0 
                  ? "Start by adding your first assignment"
                  : "Try adjusting your filters or search criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const TypeIcon = typeIcons[assignment.type];
            const dateStatus = getDateStatus(assignment.dueDate);
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Subject Color Indicator */}
                      <div 
                        className="w-1 h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSubjectColor(assignment.subjectId) }}
                      />
                      
                      {/* Assignment Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {getSubjectName(assignment.subjectId)} • {assignment.type}
                            </p>
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${statusColors[assignment.status]}`}
                              >
                                {assignment.status.replace('-', ' ')}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${priorityColors[assignment.priority]}`}
                              >
                                {assignment.priority} priority
                              </Badge>
                              {assignment.grade && (
                                <Badge variant="secondary" className="text-xs">
                                  Grade: {assignment.grade}
                                  {assignment.maxPoints && `/${assignment.maxPoints}`}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Due Date and Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className={`text-sm font-medium ${dateStatus.className}`}>
                                {dateStatus.text}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(assignment.dueDate)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Quick Status Updates */}
                              {assignment.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(assignment.id, 'in-progress')}
                                  className="text-xs"
                                >
                                  Start
                                </Button>
                              )}
                              {assignment.status === 'in-progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(assignment.id, 'submitted')}
                                  className="text-xs"
                                >
                                  Submit
                                </Button>
                              )}
                              
                              {/* Actions Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/timetable?date=${assignment.dueDate}`}>
                                      <Calendar className="h-4 w-4 mr-2" />
                                      View in Calendar
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(assignment.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        assignment={editingAssignment}
      />
    </div>
  );
}
