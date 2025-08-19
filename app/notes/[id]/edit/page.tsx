'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Tag,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work' },
  { key: 'learning', label: 'Learning' },
  { key: 'ideas', label: 'Ideas' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'journal', label: 'Journal' },
  { key: 'other', label: 'Other' }
];

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setNote(data);
          setTitle(data.title);
          setContent(data.content);
          setCategory(data.category);
          setTagsInput(data.tags.join(', '));
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/notes/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags,
        }),
      });

      if (response.ok) {
        router.push(`/notes/${params.id}`);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
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

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Note not found</h3>
            <p className="text-muted-foreground mb-4">
              The note you&apos;re trying to edit doesn&apos;t exist or may have been deleted.
            </p>
            <Button asChild>
              <Link href="/notes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/notes/${note.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Note
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="text-lg"
              />
            </div>

            {/* Category and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here... (Markdown supported)"
                className="min-h-96 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: You can use Markdown formatting for headers, lists, links, code blocks, etc.
              </p>
            </div>

            {/* Word Count */}
            <div className="text-sm text-muted-foreground">
              {content.trim().split(/\s+/).filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
