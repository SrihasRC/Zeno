'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const NOTE_CATEGORIES = [
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work' },
  { key: 'learning', label: 'Learning' },
  { key: 'ideas', label: 'Ideas' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'journal', label: 'Journal' },
  { key: 'other', label: 'Other' }
];

export default function NewNotePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('other');
  const [tagsInput, setTagsInput] = useState('');

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch('/api/notes', {
        method: 'POST',
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
        const newNote = await response.json();
        router.push(`/notes/${newNote.id}`);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

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
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Note
              </>
            )}
          </Button>
        </div>

        {/* Create Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Create New Note
            </CardTitle>
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
                autoFocus
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
                placeholder="Write your note content here... (Markdown supported)

Examples:
# Header
## Subheader
- List item
- Another item
**Bold text**
*Italic text*
`code`
```
code block
```
[Link](https://example.com)"
                className="min-h-96 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: You can use Markdown formatting for headers, lists, links, code blocks, etc.
              </p>
            </div>

            {/* Word Count and Preview */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              {content.includes('#') || content.includes('**') || content.includes('```') || content.includes('[') ? (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Markdown detected
                </span>
              ) : null}
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent('# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n- \n\n## Notes\n- \n\n## Action Items\n- [ ] ')}
                >
                  Meeting Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent('# Learning Notes\n\n## Key Concepts\n- \n\n## Code Examples\n```javascript\n// Example code\n```\n\n## Resources\n- [Link]()')}
                >
                  Learning Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent('# Project Ideas\n\n## Overview\n\n## Features\n- \n\n## Technical Requirements\n- \n\n## Next Steps\n1. ')}
                >
                  Project Ideas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent('# Daily Journal\n\n**Date:** ' + new Date().toLocaleDateString() + '\n\n## What went well\n- \n\n## Challenges\n- \n\n## Goals for tomorrow\n1. ')}
                >
                  Daily Journal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
