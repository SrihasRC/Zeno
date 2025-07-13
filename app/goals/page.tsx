'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Target, 
  Calendar, 
  TrendingUp, 
  Trophy, 
  Flag,
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3,
  User,
  Briefcase,
  Heart,
  GraduationCap,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';
import { useGoalsStore } from '@/store/goalsStore';
import type { Goal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function GoalsPage() {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    updateProgress,
    toggleComplete,
    getActiveGoals, 
    getCompletedGoals 
  } = useGoalsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | Goal['category']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state for creating/editing goals
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    progress: 0,
  });

  // Filter goals based on search and filters
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length) : 0;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      deadline: '',
      progress: 0,
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const goalData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      progress: formData.progress,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      progress: goal.progress,
    });
    setIsCreateDialogOpen(true);
  };

  const getCategoryInfo = (category: Goal['category']) => {
    switch (category) {
      case 'personal':
        return { icon: User, label: 'Personal', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' };
      case 'professional':
        return { icon: Briefcase, label: 'Professional', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950' };
      case 'health':
        return { icon: Heart, label: 'Health', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950' };
      case 'learning':
        return { icon: GraduationCap, label: 'Learning', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' };
      case 'financial':
        return { icon: DollarSign, label: 'Financial', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
      case 'other':
        return { icon: MoreHorizontal, label: 'Other', color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-950' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-blue-500';
    if (progress >= 25) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getDaysUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const categoryInfo = getCategoryInfo(goal.category);
    const CategoryIcon = categoryInfo.icon;
    const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        layout
      >
        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                    <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium text-sm ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.isCompleted && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    
                    {goal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryInfo.label}
                      </Badge>
                      <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        {goal.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditGoal(goal)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Progress</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getProgressColor(goal.progress)}`}>
                      {goal.progress}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComplete(goal.id)}
                      className="h-6 w-6 p-0"
                    >
                      {goal.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Progress value={goal.progress} className="h-2" />
                
                {!goal.isCompleted && (
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(goal.id, goal.progress + 10)}
                      disabled={goal.progress >= 100}
                      className="h-6 text-xs px-2"
                    >
                      +10%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(goal.id, goal.progress + 25)}
                      disabled={goal.progress >= 100}
                      className="h-6 text-xs px-2"
                    >
                      +25%
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {goal.deadline && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                  {daysUntilDeadline !== null && (
                    <span className={`font-medium ${
                      daysUntilDeadline < 0 ? 'text-red-500' : 
                      daysUntilDeadline <= 3 ? 'text-yellow-500' : 
                      'text-muted-foreground'
                    }`}>
                      {daysUntilDeadline < 0 
                        ? `${Math.abs(daysUntilDeadline)} days overdue` 
                        : daysUntilDeadline === 0 
                        ? 'Due today' 
                        : `${daysUntilDeadline} days left`
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
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
            <h1 className="text-2xl font-bold tracking-tight">My Goals</h1>
            <p className="text-sm text-muted-foreground">
              Track and achieve your personal and professional goals
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {filteredGoals.length} of {goals.length} goals
            </p>
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
                  <p className="text-xs font-medium text-muted-foreground">Total Goals</p>
                  <p className="text-xl font-bold">{goals.length}</p>
                </div>
                <Target className="h-4 w-4 text-muted-foreground" />
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
                  <p className="text-xs font-medium text-muted-foreground">Active</p>
                  <p className="text-xl font-bold text-blue-500">{activeGoals.length}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-blue-500" />
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
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-green-500">{completedGoals.length}</p>
                </div>
                <Trophy className="h-4 w-4 text-green-500" />
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
                  <p className="text-xs font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-xl font-bold text-purple-500">{avgProgress}%</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={(value: typeof filterCategory) => setFilterCategory(value)}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterPriority} onValueChange={(value: typeof filterPriority) => setFilterPriority(value)}>
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} size="sm" className="gap-2 h-9">
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                    <DialogDescription>
                      {editingGoal ? 'Update your goal details' : 'Set a new goal to achieve'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter goal title"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your goal"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value: Goal['category']) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="progress">Initial Progress (%)</Label>
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingGoal ? 'Update Goal' : 'Create Goal'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">All ({filteredGoals.length})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active ({activeGoals.filter(g => 
              (filterCategory === 'all' || g.category === filterCategory) &&
              (filterPriority === 'all' || g.priority === filterPriority) &&
              (g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ).length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed ({completedGoals.filter(g => 
              (filterCategory === 'all' || g.category === filterCategory) &&
              (filterPriority === 'all' || g.priority === filterPriority) &&
              (g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ).length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            <AnimatePresence>
              {filteredGoals.length === 0 ? (
                <Card className="p-6">
                  <CardContent className="p-0 text-center">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-medium mb-2">No goals found</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Create your first goal to get started'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Goal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-3">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals
                  .filter(goal => {
                    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         goal.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
                    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
                    return matchesSearch && matchesCategory && matchesPriority;
                  })
                  .map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
              </div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-3">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals
                  .filter(goal => {
                    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         goal.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
                    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
                    return matchesSearch && matchesCategory && matchesPriority;
                  })
                  .map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
              </div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
