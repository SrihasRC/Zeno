import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';

interface ProjectsStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProject: (id: string) => void;
  getProjectsByStatus: (status: Project['status']) => Project[];
  getProjectsByCategory: (category: Project['category']) => Project[];
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
          ),
        }));
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },
      getProjectsByStatus: (status) => {
        return get().projects.filter((project) => project.status === status);
      },
      getProjectsByCategory: (category) => {
        return get().projects.filter((project) => project.category === category);
      },
    }),
    {
      name: 'projects-storage',
    }
  )
);
