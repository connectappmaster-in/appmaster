import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  avatar_url?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Breadcrumbs state
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Global loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Notification state
  notifications: number;
  setNotifications: (count: number) => void;
  
  // Active module
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User state
        user: null,
        setUser: (user) => set({ user }),
        
        // Breadcrumbs state
        breadcrumbs: [],
        setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
        
        // Sidebar state
        sidebarCollapsed: false,
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        
        // Global loading state
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        // Notification state
        notifications: 0,
        setNotifications: (count) => set({ notifications: count }),
        
        // Active module
        activeModule: 'home',
        setActiveModule: (module) => set({ activeModule: module }),
      }),
      {
        name: 'appmaster-storage',
        partialize: (state) => ({ 
          sidebarCollapsed: state.sidebarCollapsed,
          user: state.user 
        }),
      }
    )
  )
);
