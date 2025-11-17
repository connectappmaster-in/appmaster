import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const { setUser, setBreadcrumbs } = useAppStore();

  useEffect(() => {
    // Initialize user from Supabase
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: roleData?.role,
        });
      }
    };

    initializeUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: roleData?.role,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  // Update breadcrumbs based on location
  useEffect(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      setBreadcrumbs([]);
      return;
    }

    const crumbs = segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { label, path };
    });

    setBreadcrumbs(crumbs);
  }, [location, setBreadcrumbs]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
