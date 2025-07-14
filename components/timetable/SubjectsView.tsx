'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit3, Trash2, Users, Target, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimetableStore } from '@/store/timetableStore';
import { SubjectDialog } from './SubjectDialog';
import type { Subject } from '@/types';

interface SubjectsViewProps {
  onCreateAssignment?: (subjectId: string) => void;
}

export function SubjectsView({ onCreateAssignment }: SubjectsViewProps) {
  const { subjects, deleteSubject, getAssignmentsForSubject } = useTimetableStore();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Subjects
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your curriculum and academic subjects
          </p>
        </div>
        
        <SubjectDialog 
          editingSubject={editingSubject}
          onEditingChange={setEditingSubject}
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length === 0 ? (
          <Card className="col-span-full p-8">
            <CardContent className="p-0 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first subject to start organizing your curriculum
              </p>
              <SubjectDialog 
                editingSubject={null}
                onEditingChange={setEditingSubject}
              />
            </CardContent>
          </Card>
        ) : (
          subjects.map((subject) => {
            const subjectAssignments = getAssignmentsForSubject(subject.id);
            const pendingCount = subjectAssignments.filter(
              a => a.status === 'pending' || a.status === 'in-progress'
            ).length;
            
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className="group"
              >
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4" 
                      style={{ borderLeftColor: subject.color }}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-5 h-5 rounded-full mt-0.5 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg leading-tight">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubject(subject)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubject(subject.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3">
                      {subject.instructor && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Instructor:</span>
                          <span className="font-medium">{subject.instructor}</span>
                        </div>
                      )}
                      
                      {subject.credits && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Credits:</span>
                          <Badge variant="secondary">{subject.credits}</Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assignments:</span>
                        <span className="font-medium">{subjectAssignments.length}</span>
                        {pendingCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {pendingCount} pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      {onCreateAssignment && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCreateAssignment(subject.id)}
                          className="flex-1 gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Assignment
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSubject(subject)}
                        className="gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Subject Statistics */}
      {subjects.length > 0 && (
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
                  <p className="text-2xl font-bold text-green-500">
                    {subjects.reduce((sum, s) => sum + (s.credits || 0), 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">With Instructors</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {subjects.filter(s => s.instructor).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {subjects.reduce((sum, s) => sum + getAssignmentsForSubject(s.id).length, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
