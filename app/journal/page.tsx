'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  MoreHorizontal,
  Heart,
  Smile,
  Meh,
  Frown,
  Star,
  Filter,
  Eye
} from 'lucide-react';
import { useNotesStore } from '@/store/notesStore';
import type { Note } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const MOOD_OPTIONS = [
  { value: 'excellent', label: 'Excellent', icon: Star, color: 'text-yellow-500' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500' },
  { value: 'stressed', label: 'Stressed', icon: Heart, color: 'text-red-500' }
];

const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Who are you grateful for and why?",
  "What achievement are you proud of today?",
  "What simple pleasure did you enjoy?",
  "What challenge helped you grow?",
  "What moment of beauty did you notice?",
  "What act of kindness did you witness or perform?"
];

export default function JournalPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'mood'>('date');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<Note | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    gratitude: '',
    highlights: '',
    challenges: '',
    tomorrow: '',
    tags: [] as string[],
    tagInput: ''
  });

  // Filter journal entries (only category 'journal')
  const journalEntries = notes.filter((note: Note) => note.category === 'journal');
  
  const filteredEntries = journalEntries.filter((entry: Note) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMood = filterMood === 'all' || entry.mood === filterMood;
    
    return matchesSearch && matchesMood;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Sort by mood priority: excellent > good > neutral > sad > stressed
      const moodOrder = { excellent: 5, good: 4, neutral: 3, sad: 2, stressed: 1 };
      return (moodOrder[b.mood as keyof typeof moodOrder] || 0) - (moodOrder[a.mood as keyof typeof moodOrder] || 0);
    }
  });

  const resetForm = () => {
    setFormData({
      title: `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: '',
      mood: 'neutral',
      gratitude: '',
      highlights: '',
      challenges: '',
      tomorrow: '',
      tags: [],
      tagInput: ''
    });
    setEditingEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) return;

    // Combine structured fields into content
    const structuredContent = `${formData.content}

${formData.gratitude ? `**Gratitude:**
${formData.gratitude}

` : ''}${formData.highlights ? `**Highlights:**
${formData.highlights}

` : ''}${formData.challenges ? `**Challenges:**
${formData.challenges}

` : ''}${formData.tomorrow ? `**Tomorrow's Focus:**
${formData.tomorrow}` : ''}`;

    const entryData = {
      title: formData.title,
      content: structuredContent.trim(),
      category: 'journal' as const,
      tags: formData.tags,
      mood: formData.mood as 'excellent' | 'good' | 'neutral' | 'sad' | 'stressed'
    };

    if (editingEntry) {
      updateNote(editingEntry.id, entryData);
    } else {
      addNote(entryData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (entry: Note) => {
    // Parse structured content back into form fields
    const lines = entry.content.split('\n');
    let content = '';
    let gratitude = '';
    let highlights = '';
    let challenges = '';
    let tomorrow = '';
    let currentSection = 'content';
    
    for (const line of lines) {
      if (line.startsWith('**Gratitude:**')) {
        currentSection = 'gratitude';
        continue;
      } else if (line.startsWith('**Highlights:**')) {
        currentSection = 'highlights';
        continue;
      } else if (line.startsWith('**Challenges:**')) {
        currentSection = 'challenges';
        continue;
      } else if (line.startsWith('**Tomorrow\'s Focus:**')) {
        currentSection = 'tomorrow';
        continue;
      }
      
      switch (currentSection) {
        case 'content':
          if (!line.startsWith('**')) content += line + '\n';
          break;
        case 'gratitude':
          gratitude += line + '\n';
          break;
        case 'highlights':
          highlights += line + '\n';
          break;
        case 'challenges':
          challenges += line + '\n';
          break;
        case 'tomorrow':
          tomorrow += line + '\n';
          break;
      }
    }

    setFormData({
      title: entry.title,
      content: content.trim(),
      mood: entry.mood || 'neutral',
      gratitude: gratitude.trim(),
      highlights: highlights.trim(),
      challenges: challenges.trim(),
      tomorrow: tomorrow.trim(),
      tags: entry.tags,
      tagInput: ''
    });
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleView = (entry: Note) => {
    setViewingEntry(entry);
    setViewDialogOpen(true);
  };

  const handleDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteNote(entryToDelete);
      setEntryToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setEntryToDelete(null);
    setDeleteDialogOpen(false);
  };

  const addTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getMoodIcon = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption ? moodOption.icon : Meh;
  };

  const getMoodColor = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption ? moodOption.color : 'text-gray-500';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getRandomGratitudePrompt = () => {
    return GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)];
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
            <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
            <p className="text-muted-foreground">
              Reflect on your day, track your mood, and practice gratitude
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Update your journal entry' : 'Reflect on your day and capture your thoughts'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter journal entry title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mood">How are you feeling today?</Label>
                    <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOOD_OPTIONS.map(mood => {
                          const Icon = mood.icon;
                          return (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${mood.color}`} />
                                {mood.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={formData.tagInput}
                          onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                          placeholder="Add a tag"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button 
                          type="button" 
                          onClick={addTag}
                          variant="outline"
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Main Entry *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write about your day, thoughts, feelings, or experiences..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gratitude">
                      Gratitude 
                      <span className="text-sm text-muted-foreground ml-2">
                        ({getRandomGratitudePrompt()})
                      </span>
                    </Label>
                    <Textarea
                      id="gratitude"
                      value={formData.gratitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                      placeholder="What are you grateful for today?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="highlights">Day&apos;s Highlights</Label>
                    <Textarea
                      id="highlights"
                      value={formData.highlights}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                      placeholder="What were the best parts of your day?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="challenges">Challenges & Lessons</Label>
                    <Textarea
                      id="challenges"
                      value={formData.challenges}
                      onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                      placeholder="What challenges did you face? What did you learn?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tomorrow">Tomorrow&apos;s Focus</Label>
                    <Textarea
                      id="tomorrow"
                      value={formData.tomorrow}
                      onChange={(e) => setFormData(prev => ({ ...prev, tomorrow: e.target.value }))}
                      placeholder="What do you want to focus on tomorrow?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{journalEntries.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {journalEntries.filter((entry: Note) => {
                      const entryDate = new Date(entry.createdAt);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mood Today</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const today = new Date().toDateString();
                      const todayEntry = journalEntries.find((entry: Note) => 
                        new Date(entry.createdAt).toDateString() === today
                      );
                      if (todayEntry && todayEntry.mood) {
                        const MoodIcon = getMoodIcon(todayEntry.mood);
                        return (
                          <>
                            <MoodIcon className={`h-6 w-6 ${getMoodColor(todayEntry.mood)}`} />
                            <span className="text-sm font-medium capitalize">{todayEntry.mood}</span>
                          </>
                        );
                      }
                      return <span className="text-sm text-muted-foreground">No entry yet</span>;
                    })()}
                  </div>
                </div>
                <div className="flex items-center">
                  {(() => {
                    const today = new Date().toDateString();
                    const todayEntry = journalEntries.find((entry: Note) => 
                      new Date(entry.createdAt).toDateString() === today
                    );
                    if (todayEntry && todayEntry.mood) {
                      const MoodIcon = getMoodIcon(todayEntry.mood);
                      return <MoodIcon className={`h-8 w-8 ${getMoodColor(todayEntry.mood)}`} />;
                    }
                    return <Meh className="h-8 w-8 text-gray-500" />;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold text-green-500">
                    {(() => {
                      let streak = 0;
                      const today = new Date();
                      
                      for (let i = 0; i < 30; i++) {
                        const checkDate = new Date(today);
                        checkDate.setDate(today.getDate() - i);
                        const hasEntry = journalEntries.some((entry: Note) => 
                          new Date(entry.createdAt).toDateString() === checkDate.toDateString()
                        );
                        
                        if (hasEntry) {
                          streak++;
                        } else if (i > 0) {
                          break;
                        }
                      }
                      
                      return streak;
                    })()}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {MOOD_OPTIONS.map(mood => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'mood')}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest First)</SelectItem>
                <SelectItem value="mood">Mood</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterMood('all')}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No journal entries found</h3>
              <p className="text-sm">
                {journalEntries.length === 0 
                  ? "Start your journaling journey by writing your first entry"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredEntries.map((entry: Note) => {
              const MoodIcon = getMoodIcon(entry.mood || 'neutral');
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <MoodIcon className={`h-5 w-5 ${getMoodColor(entry.mood || 'neutral')}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{entry.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(new Date(entry.createdAt))}
                              {entry.mood && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {entry.mood}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(entry)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Entry
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(entry.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {entry.content.split('\n')[0]}
                      </p>
                      
                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.tags.slice(0, 5).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(entry)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Read Full Entry
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="flex-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingEntry && (
                <>
                  {(() => {
                    const MoodIcon = getMoodIcon(viewingEntry.mood || 'neutral');
                    return <MoodIcon className={`h-5 w-5 ${getMoodColor(viewingEntry.mood || 'neutral')}`} />;
                  })()}
                  {viewingEntry.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewingEntry && formatDate(new Date(viewingEntry.createdAt))}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {viewingEntry && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{viewingEntry.content}</div>
              </div>
            )}
            
            {viewingEntry && viewingEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {viewingEntry.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => viewingEntry && handleEdit(viewingEntry)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Entry
            </Button>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
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
