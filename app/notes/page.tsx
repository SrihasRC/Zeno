'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  Tag,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const NOTE_CATEGORIES = [
  { key: 'all', label: 'All Notes', color: 'bg-muted', textColor: 'text-muted-foreground' },
  { key: 'personal', label: 'Personal', color: 'bg-primary/10', textColor: 'text-primary' },
  { key: 'work', label: 'Work', color: 'bg-secondary/10', textColor: 'text-secondary' },
  { key: 'learning', label: 'Learning', color: 'bg-accent/10', textColor: 'text-accent' },
  { key: 'ideas', label: 'Ideas', color: 'bg-chart-1/10', textColor: 'text-chart-1' },
  { key: 'meeting', label: 'Meeting', color: 'bg-destructive/10', textColor: 'text-destructive' },
  { key: 'journal', label: 'Journal', color: 'bg-chart-2/10', textColor: 'text-chart-2' },
  { key: 'other', label: 'Other', color: 'bg-muted', textColor: 'text-muted-foreground' }
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Delete note
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Helper functions
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (date: string) => {
    const noteDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - noteDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(noteDate);
    } else if (diffInHours < 24 * 7) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
      }).format(noteDate);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(noteDate);
    }
  };

  const getCategoryInfo = (category: string) => {
    return NOTE_CATEGORIES.find(cat => cat.key === category) || NOTE_CATEGORIES[0];
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const isMarkdown = (text: string) => {
    // Simple check for common markdown patterns
    const mdPatterns = [
      /^#{1,6}\s/m,     // Headers
      /\*\*.*\*\*/,     // Bold
      /\*.*\*/,         // Italic
      /\[.*\]\(.*\)/,   // Links
      /^-\s/m,          // Lists
      /^```/m,          // Code blocks
      /`.*`/            // Inline code
    ];
    return mdPatterns.some(pattern => pattern.test(text));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            {notes.length} notes • Markdown support enabled
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/notes/new">
            <Plus className="h-5 w-5 mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {NOTE_CATEGORIES.map((category) => (
                <SelectItem key={category.key} value={category.key}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first note to get started.'}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <Button asChild>
                <Link href="/notes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note, index) => {
            const categoryInfo = getCategoryInfo(note.category);
            const wordCount = getWordCount(note.content);
            const hasMarkdown = isMarkdown(note.content);
            
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow group">
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`${categoryInfo.color} ${categoryInfo.textColor} text-xs`}
                            variant="secondary"
                          >
                            {categoryInfo.label}
                          </Badge>
                          {hasMarkdown && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              MD
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/notes/${note.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/notes/${note.id}/edit`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {truncateText(note.content)}
                      </p>
                      
                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(note.updated_at)}
                        </span>
                        <span>{wordCount} words</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                        <Link href={`/notes/${note.id}`}>
                          Read more →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
