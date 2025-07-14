import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resource } from '@/types';

interface ResourcesStore {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, updates: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteResource: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getResourcesByCategory: (category: Resource['category']) => Resource[];
  getResourcesByType: (type: Resource['type']) => Resource[];
  getResourcesByTag: (tag: string) => Resource[];
  getFavoriteResources: () => Resource[];
}

export const useResourcesStore = create<ResourcesStore>()(
  persist(
    (set, get) => ({
      resources: [],
      addResource: (resource) => {
        const newResource: Resource = {
          ...resource,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ resources: [...state.resources, newResource] }));
      },
      updateResource: (id, updates) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id ? { ...resource, ...updates, updatedAt: new Date() } : resource
          ),
        }));
      },
      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((resource) => resource.id !== id),
        }));
      },
      toggleFavorite: (id) => {
        set((state) => ({
          resources: state.resources.map((resource) =>
            resource.id === id ? { ...resource, isFavorite: !resource.isFavorite, updatedAt: new Date() } : resource
          ),
        }));
      },
      getResourcesByCategory: (category) => {
        return get().resources.filter((resource) => resource.category === category);
      },
      getResourcesByType: (type) => {
        return get().resources.filter((resource) => resource.type === type);
      },
      getResourcesByTag: (tag) => {
        return get().resources.filter((resource) => resource.tags.includes(tag));
      },
      getFavoriteResources: () => {
        return get().resources.filter((resource) => resource.isFavorite);
      },
    }),
    {
      name: 'resources-storage',
    }
  )
);
