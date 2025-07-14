"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  Target,
  Calendar,
  TrendingUp,
  Plus,
  Play,
  Coffee,
  GraduationCap,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useTodoStore } from "@/store/todoStore";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { useEffect, useState } from "react";
import type { Task, PomodoroSession } from "@/types";

const motivationalQuotes = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "The future depends on what you do today. - Mahatma Gandhi",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
];

export default function Dashboard() {
  const { getTodaysTasks } = useTodoStore();
  const { getTodaysSessions, currentSession, isRunning } = usePomodoroStore();
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<PomodoroSession[]>([]);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setTodaysTasks(getTodaysTasks());
    setTodaysSessions(getTodaysSessions());
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [getTodaysTasks, getTodaysSessions]);

  const completedTasks = todaysTasks.filter(task => task.status === 'done').length;
  const focusTime = todaysSessions
    .filter(session => session.type === 'focus' && session.completed)
    .reduce((total, session) => total + session.duration, 0);

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
              <div className="text-xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 on track, 1 behind
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
              <div className="text-xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Days of productivity
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
                <Button size="sm" variant="outline" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
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
                  <div key={task.id} className="flex items-center space-x-2 p-2 border rounded-md">
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
              {currentSession && isRunning ? (
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">
                    Session Active
                  </div>
                  <Badge variant="default" className="mb-3 text-xs">
                    {currentSession.type.replace('-', ' ')}
                  </Badge>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Coffee className="h-3 w-3 mr-1" />
                    Take Break
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Ready to focus?
                  </div>
                  <Button className="w-full text-xs">
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
              <Button variant="outline" className="h-16 flex-col space-y-1 text-xs">
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
              <Button variant="outline" className="h-16 flex-col space-y-1 text-xs">
                <Clock className="h-4 w-4" />
                <span>Start Timer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
