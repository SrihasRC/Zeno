'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  FileText, 
  Clock, 
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setNote(data);
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/notes/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!note) return;
    
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getCategoryInfo = (category: string) => {
    return NOTE_CATEGORIES.find(cat => cat.key === category) || NOTE_CATEGORIES[0];
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const isMarkdown = (text: string) => {
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

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Note not found</h3>
            <p className="text-muted-foreground mb-4">
              The note you&apos;re looking for doesn&apos;t exist or may have been deleted.
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

  const categoryInfo = getCategoryInfo(note.category);
  const wordCount = getWordCount(note.content);
  const hasMarkdown = isMarkdown(note.content);

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
          <div className="flex gap-2">
            <Button variant="ghost" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/notes/${note.id}/edit`}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Note Content */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  {note.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge 
                    className={`${categoryInfo.color} ${categoryInfo.textColor}`}
                    variant="secondary"
                  >
                    {categoryInfo.label}
                  </Badge>
                  {hasMarkdown && (
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Markdown
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {wordCount} words
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm text-muted-foreground border-t pt-4">
              <div>
                <strong>Created:</strong> {formatDate(note.created_at)}
              </div>
              <div>
                <strong>Updated:</strong> {formatDate(note.updated_at)}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose prose-invert max-w-none">
              {hasMarkdown ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
                      const isInline = !className?.includes('language-');
                      return (
                        <code 
                          className={`${className} ${isInline ? 'bg-muted px-1 py-0.5 rounded text-sm' : ''}`} 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre({ children }) {
                      return (
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          {children}
                        </pre>
                      );
                    },
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mt-6 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-5 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="text-foreground mb-4 pl-6 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="text-foreground mb-4 pl-6 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="list-disc">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {note.content}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {note.content}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
