'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Settings,
  Coffee,
  Brain,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  X,
  Trash2
} from 'lucide-react';
import { usePomodoroStore } from '@/store/pomodoroStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_DURATIONS = {
  focus: 25,
  'short-break': 5,
  'long-break': 15,
};

export default function PomodoroPage() {
  const { 
    sessions, 
    currentSession, 
    isRunning, 
    timeLeft, 
    startSession, 
    pauseSession,
    resumeSession,
    stopSession, 
    clearSession,
    clearHistory,
    updateTimeLeft, 
    getTodaysSessions 
  } = usePomodoroStore();
  
  const [customDurations, setCustomDurations] = useState(PRESET_DURATIONS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomTimerDialogOpen, setIsCustomTimerDialogOpen] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(10);
  const [customTimerLabel, setCustomTimerLabel] = useState('Custom Timer');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const todaysSessions = getTodaysSessions();
  const completedSessions = todaysSessions.filter(s => s.completed);
  const focusSessions = completedSessions.filter(s => s.type === 'focus');
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        updateTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, updateTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeInfo = (type: 'focus' | 'short-break' | 'long-break') => {
    switch (type) {
      case 'focus':
        return { icon: Brain, label: 'Focus', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' };
      case 'short-break':
        return { icon: Coffee, label: 'Short Break', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' };
      case 'long-break':
        return { icon: Coffee, label: 'Long Break', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950' };
    }
  };

  const handleStartSession = (type: 'focus' | 'short-break' | 'long-break') => {
    const duration = customDurations[type];
    startSession(type, duration);
  };

  const handleStartCustomTimer = () => {
    const label = customTimerLabel.trim() || 'Custom Timer';
    startSession('focus', customTimerMinutes, label); // Use 'focus' type for custom timers
    setIsCustomTimerDialogOpen(false);
  };

  const handleStopSession = () => {
    stopSession();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleClearSession = () => {
    clearSession();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    const totalSeconds = currentSession.duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const SessionCard = ({ type, title, description }: { 
    type: 'focus' | 'short-break' | 'long-break';
    title: string;
    description: string;
  }) => {
    const info = getSessionTypeInfo(type);
    const Icon = info.icon;
    const isActive = currentSession?.type === type;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={`cursor-pointer transition-all h-full ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${info.bgColor}`}>
                <Icon className={`h-5 w-5 ${info.color}`} />
              </div>
              <Badge variant="outline" className="text-xs">
                {customDurations[type]}m
              </Badge>
            </div>
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground mb-3 flex-1">{description}</p>
            <Button
              onClick={() => handleStartSession(type)}
              disabled={isRunning && currentSession?.type !== type}
              size="sm"
              className="w-full h-8"
              variant={isActive ? "default" : "outline"}
            >
              {isActive && isRunning ? "Running..." : "Start"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
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
            <h1 className="text-2xl font-bold tracking-tight">Pomodoro Timer</h1>
            <p className="text-sm text-muted-foreground">
              Boost productivity with focused work sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                  <DialogDescription>
                    Customize your session durations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="focus-duration">Focus Duration (minutes)</Label>
                    <Input
                      id="focus-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={customDurations.focus}
                      onChange={(e) => setCustomDurations(prev => ({
                        ...prev,
                        focus: parseInt(e.target.value) || 25
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-break-duration">Short Break Duration (minutes)</Label>
                    <Input
                      id="short-break-duration"
                      type="number"
                      min="1"
                      max="30"
                      value={customDurations['short-break']}
                      onChange={(e) => setCustomDurations(prev => ({
                        ...prev,
                        'short-break': parseInt(e.target.value) || 5
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break-duration">Long Break Duration (minutes)</Label>
                    <Input
                      id="long-break-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={customDurations['long-break']}
                      onChange={(e) => setCustomDurations(prev => ({
                        ...prev,
                        'long-break': parseInt(e.target.value) || 15
                      }))}
                    />
                  </div>
                  <Button 
                    onClick={() => setIsSettingsOpen(false)} 
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                  <p className="text-xs font-medium text-muted-foreground">Today&apos;s Sessions</p>
                  <p className="text-xl font-bold">{completedSessions.length}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
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
                  <p className="text-xs font-medium text-muted-foreground">Focus Sessions</p>
                  <p className="text-xl font-bold text-blue-500">{focusSessions.length}</p>
                </div>
                <Brain className="h-4 w-4 text-blue-500" />
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
                  <p className="text-xs font-medium text-muted-foreground">Focus Time</p>
                  <p className="text-xl font-bold text-purple-500">{totalFocusTime}m</p>
                </div>
                <Clock className="h-4 w-4 text-purple-500" />
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
                  <p className="text-xs font-medium text-muted-foreground">Productivity</p>
                  <p className="text-xl font-bold text-orange-500">
                    {focusSessions.length >= 4 ? 'High' : focusSessions.length >= 2 ? 'Good' : 'Low'}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Current Session Timer */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const info = getSessionTypeInfo(currentSession.type);
                      const Icon = info.icon;
                      const displayLabel = currentSession.label || info.label;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${info.color}`} />
                          <h2 className="text-lg font-semibold">{displayLabel}</h2>
                        </>
                      );
                    })()}
                  </div>
                  <Badge variant="outline">
                    Session {completedSessions.length + 1}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="text-6xl font-mono font-bold tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      if (isRunning) {
                        pauseSession();
                      } else {
                        resumeSession();
                      }
                    }}
                    size="lg"
                    className="gap-2"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleStopSession}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Complete
                  </Button>
                  
                  <Button
                    onClick={() => updateTimeLeft(currentSession.duration * 60)}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  
                  <Button
                    onClick={handleClearSession}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Session Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold">Start a Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SessionCard
            type="focus"
            title="Focus Session"
            description="Deep work and concentration time"
          />
          <SessionCard
            type="short-break"
            title="Short Break"
            description="Quick rest between focus sessions"
          />
          <SessionCard
            type="long-break"
            title="Long Break"
            description="Extended break after multiple sessions"
          />
          
          {/* Custom Timer Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="cursor-pointer transition-all h-full hover:shadow-md">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <Settings className="h-5 w-5 text-orange-500" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">Custom Timer</h3>
                <p className="text-xs text-muted-foreground mb-3 flex-1">Set your own duration</p>
                <Dialog open={isCustomTimerDialogOpen} onOpenChange={setIsCustomTimerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="w-full h-8"
                      variant="outline"
                    >
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Custom Timer</DialogTitle>
                      <DialogDescription>
                        Set up your custom timer session
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-duration">Duration (minutes)</Label>
                        <Input
                          id="custom-duration"
                          type="number"
                          min="1"
                          max="180"
                          value={customTimerMinutes}
                          onChange={(e) => setCustomTimerMinutes(parseInt(e.target.value) || 10)}
                          placeholder="Enter duration in minutes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-label">Session Label (optional)</Label>
                        <Input
                          id="custom-label"
                          type="text"
                          value={customTimerLabel}
                          onChange={(e) => setCustomTimerLabel(e.target.value)}
                          placeholder="e.g., Study, Workout, Reading"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleStartCustomTimer}
                          className="flex-1"
                          disabled={customTimerMinutes < 1}
                        >
                          Start Timer ({customTimerMinutes}m)
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsCustomTimerDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Session History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Tabs defaultValue="today" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Session History</h2>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    disabled={sessions.length === 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Session History</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all session history? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => clearHistory()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <TabsList className="grid w-48 grid-cols-2">
                <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All Time</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="today" className="space-y-3">
            {todaysSessions.length === 0 ? (
              <Card className="p-6">
                <CardContent className="p-0 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-medium mb-2">No sessions today</h3>
                  <p className="text-xs text-muted-foreground">
                    Start your first session to track your productivity
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {todaysSessions.map((session) => {
                  const info = getSessionTypeInfo(session.type);
                  const Icon = info.icon;
                  
                  return (
                    <Card key={session.id} className="p-3">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded ${info.bgColor}`}>
                              <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{session.label || info.label}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.startTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                              {session.completed ? "Completed" : "Incomplete"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.duration}m
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-3">
            {sessions.length === 0 ? (
              <Card className="p-6">
                <CardContent className="p-0 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-medium mb-2">No sessions yet</h3>
                  <p className="text-xs text-muted-foreground">
                    Your session history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session) => {
                  const info = getSessionTypeInfo(session.type);
                  const Icon = info.icon;
                  
                  return (
                    <Card key={session.id} className="p-3">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded ${info.bgColor}`}>
                              <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{session.label || info.label}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.startTime).toLocaleDateString()} at{' '}
                                {new Date(session.startTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                              {session.completed ? "Completed" : "Incomplete"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.duration}m
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
