'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Rocket, 
  Code, 
  Globe, 
  Database,
  Smartphone,
  Briefcase,
  Calendar,
  GitBranch,
  ExternalLink,
  Edit3,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { useProjectsStore } from '@/store/projectsStore';
import type { Project } from '@/types';
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

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
  'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring',
  'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Firebase', 'Vercel', 'Netlify',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter',
  'OpenAI', 'Hugging Face', 'LangChain', 'OpenCV', 'NLTK', 'Keras'
];

const PROJECT_CATEGORIES = [
  { key: 'web', label: 'Web Development', icon: Globe, color: 'bg-blue-500' },
  { key: 'mobile', label: 'Mobile App', icon: Smartphone, color: 'bg-green-500' },
  { key: 'api', label: 'API/Backend', icon: Database, color: 'bg-purple-500' },
  { key: 'desktop', label: 'Desktop App', icon: Code, color: 'bg-orange-500' },
  { key: 'aiml', label: 'AI/ML', icon: Brain, color: 'bg-pink-500' },
  { key: 'other', label: 'Other', icon: Briefcase, color: 'bg-gray-500' }
];

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    customCategory: '',
    status: 'planning' as Project['status'],
    techStack: [] as string[],
    customTechStack: '',
    repositoryUrl: '',
    liveUrl: '',
    notes: ''
  });

  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'web',
      customCategory: '',
      status: 'planning',
      techStack: [],
      customTechStack: '',
      repositoryUrl: '',
      liveUrl: '',
      notes: ''
    });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      description: formData.description,
      category: formData.category as Project['category'],
      customCategory: formData.category === 'other' ? formData.customCategory : undefined,
      status: formData.status,
      tags: [], // Can be added later if needed
      techStack: formData.techStack,
      customTechStack: formData.customTechStack || undefined,
      repositoryUrl: formData.repositoryUrl,
      liveUrl: formData.liveUrl,
      notes: formData.notes
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      customCategory: project.customCategory || '',
      status: project.status,
      techStack: project.techStack,
      customTechStack: project.customTechStack || '',
      repositoryUrl: project.repositoryUrl || '',
      liveUrl: project.liveUrl || '',
      notes: project.notes
    });
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setProjectToDelete(null);
    setDeleteDialogOpen(false);
  };

  const addTechStack = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const addCustomTechStack = () => {
    const customTech = formData.customTechStack.trim();
    if (customTech && !formData.techStack.includes(customTech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, customTech],
        customTechStack: ''
      }));
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'in-progress': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'done': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'on-hold': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getCategoryInfo = (category: string) => {
    const found = PROJECT_CATEGORIES.find(cat => cat.key === category);
    if (found) return found;
    // Return a default for unknown categories (like custom categories)
    return { key: 'other', label: 'Other', icon: Briefcase, color: 'bg-gray-500' };
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
            <h1 className="text-3xl font-bold tracking-tight">Projects Board</h1>
            <p className="text-muted-foreground">
              Manage your personal coding projects and track your progress
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject ? 'Update your project details' : 'Add a new project to track your development work'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.key} value={cat.key}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Category Input */}
                {formData.category === 'other' && (
                  <div>
                    <Label htmlFor="customCategory">Custom Category</Label>
                    <Input
                      id="customCategory"
                      value={formData.customCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="Enter custom category"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Project['status'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="repository">Repository URL</Label>
                    <Input
                      id="repository"
                      type="url"
                      value={formData.repositoryUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div>
                  <Label>Tech Stack</Label>
                  <div className="space-y-2">
                    <Select onValueChange={addTechStack}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add technology" />
                      </SelectTrigger>
                      <SelectContent>
                        {TECH_STACK_OPTIONS.map(tech => (
                          <SelectItem key={tech} value={tech}>
                            {tech}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Tech Stack Input */}
                    <div className="flex gap-2">
                      <Input
                        value={formData.customTechStack}
                        onChange={(e) => setFormData(prev => ({ ...prev, customTechStack: e.target.value }))}
                        placeholder="Add custom technology"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTechStack())}
                      />
                      <Button 
                        type="button" 
                        onClick={addCustomTechStack}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map(tech => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTechStack(tech)}
                        >
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes, goals, or ideas"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Update Project' : 'Create Project'}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {projects.filter((p: Project) => p.status === 'in-progress').length}
                  </p>
                </div>
                <Rocket className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {projects.filter((p: Project) => p.status === 'done').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planning</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {projects.filter((p: Project) => p.status === 'planning').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PROJECT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-sm">
                {projects.length === 0 
                  ? "Start by creating your first project"
                  : "Try adjusting your filters or search criteria"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project: Project) => {
              const categoryInfo = getCategoryInfo(project.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                            <CategoryIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                            <Badge className={`mt-1 ${getStatusColor(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(project)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(project.id)}
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
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      
                      {/* Tech Stack */}
                      {project.techStack.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {project.techStack.slice(0, 4).map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.techStack.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Links */}
                      <div className="flex gap-2">
                        {project.repositoryUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a 
                              href={project.repositoryUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              <GitBranch className="h-3 w-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                        
                        {project.liveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a 
                              href={project.liveUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
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
