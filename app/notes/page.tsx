'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  Tag,
  Edit3,
  Trash2,
  MoreHorizontal,
  BookOpen,
  StickyNote,
  Clock,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Users,
  MessageSquare
} from 'lucide-react';
import { useNotesStore } from '@/store/notesStore';
import type { Note } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const NOTE_CATEGORIES = [
  { key: 'all', label: 'All Notes', color: 'bg-gray-100', textColor: 'text-gray-700', icon: FileText },
  { key: 'personal', label: 'Personal', color: 'bg-blue-100', textColor: 'text-blue-700', icon: User },
  { key: 'work', label: 'Work', color: 'bg-green-100', textColor: 'text-green-700', icon: Briefcase },
  { key: 'learning', label: 'Learning', color: 'bg-purple-100', textColor: 'text-purple-700', icon: GraduationCap },
  { key: 'ideas', label: 'Ideas', color: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Lightbulb },
  { key: 'meeting', label: 'Meeting', color: 'bg-red-100', textColor: 'text-red-700', icon: Users },
  { key: 'journal', label: 'Journal', color: 'bg-orange-100', textColor: 'text-orange-700', icon: MessageSquare },
  { key: 'other', label: 'Other', color: 'bg-gray-100', textColor: 'text-gray-700', icon: StickyNote }
];

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal',
    tags: [] as string[],
    tagInput: ''
  });

  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper functions
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } else if (diffInHours < 24 * 7) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  const formatLongDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryInfo = (category: string) => {
    return NOTE_CATEGORIES.find(cat => cat.key === category) || NOTE_CATEGORIES[0];
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'personal',
      tags: [],
      tagInput: ''
    });
    setEditingNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) return;

    const noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      content: formData.content,
      category: formData.category as Note['category'],
      tags: formData.tags
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote(noteData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags,
      tagInput: ''
    });
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
    setViewDialogOpen(true);
  };

  const handleDelete = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setNoteToDelete(null);
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

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Notes & Journal
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Capture your thoughts, ideas, and important insights
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="lg" className="shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
                <DialogDescription>
                  {editingNote ? 'Update your note details' : 'Capture your thoughts and ideas'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a compelling title..."
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_CATEGORIES.filter(cat => cat.key !== 'all').map(cat => (
                        <SelectItem key={cat.key} value={cat.key}>
                          <div className="flex items-center gap-2">
                            <cat.icon className={`h-4 w-4 ${cat.textColor}`} />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-base font-medium">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Start writing your thoughts..."
                    required
                    rows={12}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Tags</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={formData.tagInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button 
                        type="button" 
                        onClick={addTag}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          onClick={() => removeTag(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNote ? 'Update Note' : 'Create Note'}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                  <p className="text-2xl font-bold">{notes.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {notes.filter((n: Note) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(n.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(notes.map((n: Note) => n.category)).size}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tags</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(notes.flatMap((n: Note) => n.tags)).size}
                  </p>
                </div>
                <StickyNote className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {NOTE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>
                    <div className="flex items-center gap-2">
                      <cat.icon className={`h-4 w-4 ${cat.textColor}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Display */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No notes found</h3>
              <p className="text-base">
                {notes.length === 0 
                  ? "Start by creating your first note to capture your thoughts"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredNotes.map((note: Note) => {
              const categoryInfo = getCategoryInfo(note.category);
              const readingTime = getReadingTime(note.content);
              
              return (
                <motion.article
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-muted hover:border-l-primary">
                    <CardContent className="p-8">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${categoryInfo.color}`}>
                              <categoryInfo.icon className={`h-5 w-5 ${categoryInfo.textColor}`} />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color} ${categoryInfo.textColor}`}>
                                {categoryInfo.label}
                              </span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(new Date(note.createdAt))}
                              </div>
                              <span>•</span>
                              <span>{readingTime} min read</span>
                            </div>
                          </div>
                          
                          <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors cursor-pointer" 
                              onClick={() => handleView(note)}>
                            {note.title}
                          </h2>
                          
                          <div className="prose prose-lg max-w-none mb-6">
                            <p className="text-muted-foreground leading-relaxed text-base">
                              {truncateText(note.content, 300)}
                            </p>
                          </div>
                          
                          {/* Tags */}
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {note.tags.slice(0, 5).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-sm bg-muted/50 hover:bg-muted transition-colors">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 5 && (
                                <Badge variant="outline" className="text-sm">
                                  +{note.tags.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(note)}
                              className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Read Full Note
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(note)}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(note)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Note
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(note)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(note.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* View Note Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          {viewingNote && (
            <>
              <DialogHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${getCategoryInfo(viewingNote.category).color}`}>
                        {(() => {
                          const CategoryIcon = getCategoryInfo(viewingNote.category).icon;
                          return <CategoryIcon className={`h-5 w-5 ${getCategoryInfo(viewingNote.category).textColor}`} />;
                        })()}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryInfo(viewingNote.category).color} ${getCategoryInfo(viewingNote.category).textColor}`}>
                          {getCategoryInfo(viewingNote.category).label}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatLongDate(new Date(viewingNote.createdAt))}
                        </div>
                        <span>•</span>
                        <span>{getWordCount(viewingNote.content)} words</span>
                        <span>•</span>
                        <span>{getReadingTime(viewingNote.content)} min read</span>
                      </div>
                    </div>
                    <DialogTitle className="text-3xl font-bold mb-6">
                      {viewingNote.title}
                    </DialogTitle>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewDialogOpen(false);
                        setTimeout(() => handleEdit(viewingNote), 100);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8">
                <div className="prose prose-xl max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground text-lg">
                    {viewingNote.content}
                  </div>
                </div>

                {viewingNote.tags.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingNote.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-sm bg-muted hover:bg-muted/80 px-3 py-1">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
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
