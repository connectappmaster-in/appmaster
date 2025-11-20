import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userType, appmasterRole } = useAuth();

  const { data: isAppmasterAdmin, isLoading } = useQuery({
    queryKey: ["is-appmaster-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from("appmaster_admins")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user,
  });

  const isSuperAdmin = userType === "appmaster_admin" || !!appmasterRole || !!isAppmasterAdmin;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
