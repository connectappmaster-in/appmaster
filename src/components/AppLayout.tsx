import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import Navbar from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';

export const AppLayout = () => {
  const location = useLocation();
  const { setUser, setActiveModule } = useAppStore();

  // Update active module based on route
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'home';
    setActiveModule(path);
  }, [location.pathname, setActiveModule]);

  // Sync user state with Supabase auth
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: roleData?.role || 'user',
          full_name: profileData?.full_name || undefined,
          avatar_url: profileData?.avatar_url || undefined,
        });
      } else {
        setUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: roleData?.role || 'user',
          full_name: profileData?.full_name || undefined,
          avatar_url: profileData?.avatar_url || undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  // Pages that shouldn't show breadcrumbs
  const hideBreadcrumbsRoutes = ['/', '/login', '/auth/confirm', '/initialize-admin'];
  const shouldShowBreadcrumbs = !hideBreadcrumbsRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12">
        <div className="container mx-auto px-4 py-6">
          {shouldShowBreadcrumbs && <Breadcrumbs />}
          <Outlet />
        </div>
      </main>
    </div>
  );
};
