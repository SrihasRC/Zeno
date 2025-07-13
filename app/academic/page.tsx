'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen,
  FileText,
  Calendar,
  Target,
  AlertCircle,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { useTimetableStore } from '@/store/timetableStore';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubjectsView } from '@/components/timetable/SubjectsView';
import { AssignmentsView } from '@/components/academic/AssignmentsView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AcademicPlannerPage() {
  const { subjects, assignments } = useTimetableStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'assignments'>('overview');

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress');
  const upcomingAssignments = assignments
    .filter(a => a.status === 'pending' || a.status === 'in-progress')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

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

  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-green-500">{totalCredits}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold text-purple-500">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-500">{pendingAssignments.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/timetable">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span className="font-medium">View Timetable</span>
                <span className="text-xs text-muted-foreground">Manage your schedule</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveTab('subjects')}
            >
              <BookOpen className="h-6 w-6" />
              <span className="font-medium">Manage Subjects</span>
              <span className="text-xs text-muted-foreground">Add or edit subjects</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveTab('assignments')}
            >
              <FileText className="h-6 w-6" />
              <span className="font-medium">View Assignments</span>
              <span className="text-xs text-muted-foreground">Track your tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Assignments</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveTab('assignments')}
            >
              View All
            </Button>
          </div>
          
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No upcoming assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                const isOverdue = daysUntil < 0;
                const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
                
                return (
                  <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSubjectColor(assignment.subjectId) }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{assignment.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {getSubjectName(assignment.subjectId)} • {assignment.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${priorityColors[assignment.priority]}`}
                      >
                        {assignment.priority}
                      </Badge>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${
                          isOverdue ? 'text-red-600' : 
                          isDueSoon ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                           daysUntil === 0 ? 'Due today' :
                           daysUntil === 1 ? 'Due tomorrow' :
                           `${daysUntil} days left`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed Assignments</span>
                  <span>{assignments.filter(a => a.status === 'graded').length}/{assignments.length}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${assignments.length > 0 ? (assignments.filter(a => a.status === 'graded').length / assignments.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Submitted Assignments</span>
                  <span>{assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length}/{assignments.length}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${assignments.length > 0 ? (assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length / assignments.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Study Load
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Credits</span>
                <span className="font-medium">{totalCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Subjects</span>
                <span className="font-medium">{subjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Credits/Subject</span>
                <span className="font-medium">
                  {subjects.length > 0 ? (totalCredits / subjects.length).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending Tasks</span>
                <span className="font-medium text-orange-600">{pendingAssignments.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              Academic Planner
            </h1>
            <p className="text-muted-foreground">
              Manage your subjects, assignments, and academic progress
            </p>
          </div>
          
          <Link href="/timetable">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              View Timetable
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectsView />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsView />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
