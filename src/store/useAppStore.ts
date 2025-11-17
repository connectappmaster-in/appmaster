import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Breadcrumb state
  breadcrumbs: Array<{ label: string; path: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  
  // Module state
  currentModule: string;
  setCurrentModule: (module: string) => void;
  
  // Notifications
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // UI state
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // Breadcrumb state
      breadcrumbs: [],
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      
      // Module state
      currentModule: 'dashboard',
      setCurrentModule: (module) => set({ currentModule: module }),
      
      // Notifications
      unreadNotifications: 0,
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
    }),
    {
      name: 'appmaster-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
