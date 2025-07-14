'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Grid3X3,
  CalendarDays,
  List,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { useTimetableStore } from '@/store/timetableStore';
import type { TimetableBlock } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MonthlyView } from '@/components/timetable/MonthlyView';
import { WeeklyView } from '@/components/timetable/WeeklyView';
import { ListView } from '@/components/timetable/ListView';
import { EventDialog } from '@/components/timetable/EventDialog';
import { AssignmentDialog } from '@/components/academic/AssignmentDialog';
import Link from 'next/link';

export default function TimetablePage() {
  const { 
    blocks, assignments
  } = useTimetableStore();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'list'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<TimetableBlock | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  
  const totalBlocks = blocks.length;
  const recurringBlocks = blocks.filter(b => b.type === 'recurring').length;
  const oneTimeBlocks = blocks.filter(b => b.type === 'one-time').length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress');

  const handleEditBlock = (block: TimetableBlock) => {
    setEditingBlock(block);
    setIsEventDialogOpen(true);
  };

  const handleEditAssignment = (assignmentId: string) => {
    setEditingAssignmentId(assignmentId);
    setIsAssignmentDialogOpen(true);
  };

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
              <Calendar className="h-8 w-8" />
              Timetable & Calendar
            </h1>
            <p className="text-muted-foreground">
              View and manage your schedule, events, and time blocks
            </p>
          </div>
          
          <Link href="/academic">
            <Button variant="outline" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic Planner
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totalBlocks}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recurring</p>
                  <p className="text-2xl font-bold text-blue-500">{recurringBlocks}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">One-time</p>
                  <p className="text-2xl font-bold text-green-500">{oneTimeBlocks}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-orange-500">{pendingAssignments.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="monthly" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>

            {/* Add Event Button for Calendar Views */}
            {(activeTab === 'monthly' || activeTab === 'weekly' || activeTab === 'list') && (
              <EventDialog
                editingBlock={editingBlock}
                onEditingChange={setEditingBlock}
                isOpen={isEventDialogOpen}
                onOpenChange={setIsEventDialogOpen}
              />
            )}
          </div>

          <TabsContent value="monthly" className="space-y-6">
            <MonthlyView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEditBlock={handleEditBlock}
              onEditAssignment={handleEditAssignment}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <WeeklyView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEditBlock={handleEditBlock}
              onEditAssignment={handleEditAssignment}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <ListView
              onEditBlock={handleEditBlock}
              onEditAssignment={handleEditAssignment}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialogs */}
      <EventDialog
        isOpen={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        editingBlock={editingBlock}
        onEditingChange={setEditingBlock}
      />

      <AssignmentDialog
        open={isAssignmentDialogOpen}
        onOpenChange={setIsAssignmentDialogOpen}
        assignment={editingAssignmentId ? useTimetableStore.getState().assignments.find(a => a.id === editingAssignmentId) : null}
      />
    </div>
  );
}
