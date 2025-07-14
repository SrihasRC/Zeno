'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  Image as ImageIcon,
  File,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  Upload,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useResourcesStore } from '@/store/resourcesStore';
import type { Resource } from '@/types';
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

const RESOURCE_TYPES = [
  { key: 'all', label: 'All Resources' },
  { key: 'website', label: 'Websites' },
  { key: 'youtube', label: 'YouTube Videos' },
  { key: 'link', label: 'Other Links' }
];

export default function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useResourcesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'website' as 'website' | 'youtube' | 'link',
    notes: '',
    tags: [] as string[],
    tagInput: ''
  });

  const filteredResources = resources.filter((resource: Resource) => {
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesType = true;
    if (filterType !== 'all') {
      matchesType = resource.type === filterType;
    }
    
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      type: 'website',
      notes: '',
      tags: [],
      tagInput: ''
    });
    setEditingResource(null);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) return;

    if (editingResource) {
      // Update existing resource
      const updateData: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>> = {
        title: formData.title,
        url: formData.url,
        type: formData.type,
        notes: formData.notes,
        tags: formData.tags
      };

      // Add YouTube ID if it's a YouTube link
      if (formData.type === 'youtube') {
        const youtubeId = extractYouTubeId(formData.url);
        if (youtubeId) updateData.youtubeId = youtubeId;
      }

      updateResource(editingResource.id, updateData);
    } else {
      // Create new resource
      const resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.notes,
        type: formData.type,
        category: 'reference',
        url: formData.url,
        tags: formData.tags,
        notes: formData.notes
      };

      // Add YouTube ID if it's a YouTube link
      if (formData.type === 'youtube') {
        const youtubeId = extractYouTubeId(formData.url);
        if (youtubeId) resourceData.youtubeId = youtubeId;
      }

      addResource(resourceData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      url: resource.url || '',
      type: resource.type === 'youtube' ? 'youtube' : resource.type === 'website' ? 'website' : 'link',
      notes: resource.notes,
      tags: resource.tags,
      tagInput: ''
    });
    setEditingResource(resource);
    setIsDialogOpen(true);
  };

  const handleDelete = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (resourceToDelete) {
      deleteResource(resourceToDelete);
      setResourceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setResourceToDelete(null);
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube': return ImageIcon;
      case 'website': return FileText;
      default: return File;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
            <h1 className="text-3xl font-bold tracking-tight">Resources Vault</h1>
            <p className="text-muted-foreground">
              Store and organize your links, websites, and YouTube videos
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </DialogTitle>
                <DialogDescription>
                  {editingResource ? 'Update resource details' : 'Add a website, YouTube video, or other link'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter resource title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'website' | 'youtube' | 'link' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="youtube">YouTube Video</SelectItem>
                      <SelectItem value="link">Other Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder={formData.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this resource..."
                    rows={4}
                  />
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingResource ? 'Update Resource' : 'Add Resource'}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold">{resources.length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Websites</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {resources.filter((r: Resource) => r.type === 'website').length}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">YouTube Videos</p>
                  <p className="text-2xl font-bold text-green-500">
                    {resources.filter((r: Resource) => r.type === 'youtube').length}
                  </p>
                </div>
                <ImageIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Other Links</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {resources.filter((r: Resource) => r.type === 'link').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-sm">
                {resources.length === 0 
                  ? "Start by adding your first resource"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          <AnimatePresence>
            {filteredResources.map((resource: Resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <ResourceIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(new Date(resource.createdAt))}
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {resource.type}
                              </Badge>
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
                            <DropdownMenuItem onClick={() => window.open(resource.url, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visit Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(resource)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(resource.id)}
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
                      {resource.notes && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {resource.notes}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                        {resource.type === 'youtube' && resource.youtubeId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${resource.youtubeId}`, '_blank')}
                            className="flex-1"
                          >
                            <ImageIcon className="h-3 w-3 mr-1" />
                            YouTube
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>        )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
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
