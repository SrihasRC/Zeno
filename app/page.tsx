"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  Target,
  Calendar,
  TrendingUp,
  Plus,
  Play,
  Pause,
  Square,
  GraduationCap,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useTodoStore } from "@/store/todoStore";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { useGoalsStore } from "@/store/goalsStore";
import { useEffect, useState } from "react";
import type { Task, PomodoroSession, Goal } from "@/types";
import { ProtectedRoute } from "@/components/protected-route";

const motivationalQuotes = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "The future depends on what you do today. - Mahatma Gandhi",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
];

function Dashboard() {
  const { getTodaysTasks, addTask, updateTask } = useTodoStore();
  const { getTodaysSessions, currentSession, isRunning, startSession, pauseSession, resumeSession, stopSession, timeLeft, updateTimeLeft } = usePomodoroStore();
  const { getActiveGoals } = useGoalsStore();
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<PomodoroSession[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [quote, setQuote] = useState("");
  
  // Quick task form state
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  useEffect(() => {
    const updateData = () => {
      setTodaysTasks(getTodaysTasks());
      setTodaysSessions(getTodaysSessions());
      setActiveGoals(getActiveGoals());
    };
    
    updateData();
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Update data every minute to keep it fresh
    const interval = setInterval(updateData, 60000);
    return () => clearInterval(interval);
  }, [getTodaysTasks, getTodaysSessions, getActiveGoals]);

  // Pomodoro timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && currentSession && timeLeft > 0) {
      interval = setInterval(() => {
        updateTimeLeft(timeLeft - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentSession, timeLeft, updateTimeLeft]);

  const completedTasks = todaysTasks.filter(task => task.status === 'done').length;
  const focusTime = todaysSessions
    .filter(session => session.type === 'focus' && session.completed)
    .reduce((total, session) => total + session.duration, 0);

  // Calculate streak (days with at least one completed task or focus session)
  const calculateStreak = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Check if there were completed tasks or focus sessions on this day
      const hasActivity = getTodaysSessions().some(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= date && sessionDate < nextDay && session.completed;
      }) || getTodaysTasks().some(task => {
        const taskDate = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt);
        return taskDate >= date && taskDate < nextDay && task.status === 'done';
      });
      
      if (hasActivity) {
        days.push(date);
      } else {
        break; // Streak broken
      }
    }
    
    return days.length;
  };

  const streak = calculateStreak();

  // Goals analysis
  const onTrackGoals = activeGoals.filter(goal => {
    if (!goal.deadline) return true;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(100, Math.max(0, 100 - (daysLeft / 30) * 100)); // Rough calculation
    return goal.progress >= expectedProgress * 0.8; // On track if within 20% of expected
  }).length;

  const behindGoals = activeGoals.length - onTrackGoals;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickAddTask = () => {
    if (!quickTaskTitle.trim()) return;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Due by end of today
    
    addTask({
      title: quickTaskTitle,
      description: '',
      status: 'pending',
      priority: 'medium',
      tags: ['quick-add'],
      subtasks: [],
      dueDate: today,
    });
    
    setQuickTaskTitle("");
    setIsAddTaskDialogOpen(false);
    // Refresh today's tasks
    setTodaysTasks(getTodaysTasks());
  };

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    updateTask(task.id, { status: newStatus });
    setTodaysTasks(getTodaysTasks());
  };

  const handleStartPomodoro = () => {
    startSession('focus', 25); // 25 minutes
  };

  const handlePauseResume = () => {
    if (isRunning) {
      pauseSession();
    } else {
      resumeSession();
    }
  };

  const handleStopPomodoro = () => {
    stopSession();
    setTodaysSessions(getTodaysSessions());
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here&apos;s your productivity overview for today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20"
        >
          <p className="text-xs italic text-muted-foreground">&quot;{quote}&quot;</p>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Today&apos;s Tasks</CardTitle>
              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl font-bold">{completedTasks}/{todaysTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {todaysTasks.length > 0 
                  ? `${Math.round((completedTasks / todaysTasks.length) * 100)}% complete`
                  : "No tasks for today"
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Focus Time</CardTitle>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl font-bold">{focusTime}m</div>
              <p className="text-xs text-muted-foreground">
                {todaysSessions.length} sessions completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Active Goals</CardTitle>
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeGoals.length > 0 
                  ? `${onTrackGoals} on track, ${behindGoals} behind`
                  : "No active goals"
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Streak</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">
                {streak === 1 ? "Day of productivity" : "Days of productivity"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today&apos;s Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Today&apos;s Tasks</CardTitle>
                <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Quick Add Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="task-title">Task Title</Label>
                        <Input
                          id="task-title"
                          value={quickTaskTitle}
                          onChange={(e) => setQuickTaskTitle(e.target.value)}
                          placeholder="Enter task title..."
                          onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleQuickAddTask}>
                          Add Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No tasks scheduled for today</p>
                  <p className="text-xs">Add some tasks to get started!</p>
                </div>
              ) : (
                todaysTasks.slice(0, 5).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleToggleTaskStatus(task)}
                  >
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 p-0 rounded-sm border border-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTaskStatus(task);
                      }}
                    >
                      {task.status === 'done' && <CheckSquare className="h-3 w-3" />}
                    </Button>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="text-xs">
                          {task.status.replace('-', ' ')}
                        </Badge>
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pomodoro Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pomodoro Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              {currentSession && (isRunning || currentSession) ? (
                <div className="text-center space-y-3">
                  <div className="text-2xl font-mono font-bold">
                    {formatTime(timeLeft)}
                  </div>
                  <Badge variant="default" className="mb-3 text-xs">
                    {currentSession.type === 'focus' ? 'Focus Session' : 
                     currentSession.type === 'short-break' ? 'Short Break' : 'Long Break'}
                  </Badge>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={handlePauseResume} className="text-xs">
                      {isRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleStopPomodoro} className="text-xs">
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Ready to focus?
                  </div>
                  <Button className="w-full text-xs" onClick={handleStartPomodoro}>
                    <Play className="h-3 w-3 mr-1" />
                    Start 25min Focus
                  </Button>
                </div>
              )}
              
              <div className="space-y-1 pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Today&apos;s Sessions</span>
                  <span className="font-medium">{todaysSessions.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Focus Time</span>
                  <span className="font-medium">{focusTime}m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col space-y-1 text-xs"
                onClick={() => setIsAddTaskDialogOpen(true)}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
              <Link href="/timetable">
                <Button variant="outline" className="h-16 w-full flex-col space-y-1 text-xs">
                  <Calendar className="h-4 w-4" />
                  <span>Timetable</span>
                </Button>
              </Link>
              <Link href="/academic">
                <Button variant="outline" className="h-16 w-full flex-col space-y-1 text-xs">
                  <GraduationCap className="h-4 w-4" />
                  <span>Academic</span>
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" className="h-16 w-full flex-col space-y-1 text-xs">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" className="h-16 w-full flex-col space-y-1 text-xs">
                  <FolderOpen className="h-4 w-4" />
                  <span>Resources</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="h-16 flex-col space-y-1 text-xs"
                onClick={handleStartPomodoro}
                disabled={!!(currentSession && isRunning)}
              >
                <Clock className="h-4 w-4" />
                <span>{currentSession && isRunning ? 'Timer Active' : 'Start Timer'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardWithAuth() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default DashboardWithAuth;
