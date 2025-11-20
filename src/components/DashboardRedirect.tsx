import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const DashboardRedirect = () => {
  const { user, accountType, userRole, userType, appmasterRole, loading } = useAuth();

  // Check if the user is an active AppMaster admin
  const { data: isAppmasterAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-appmaster-admin", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from("appmaster_admins")
        .select("admin_role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      return data?.admin_role || null;
    },
    enabled: !!user,
  });

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // AppMaster Admin gets priority
  if (userType === "appmaster_admin" || isAppmasterAdmin || appmasterRole) {
    return <Navigate to="/super-admin" replace />;
  }

  // Individual account users
  if (userType === "individual" || accountType === "personal") {
    return <Navigate to="/dashboard/individual" replace />;
  }

  // Organization account users
  if (userType === "organization" || accountType === "organization") {
    const role = userRole?.toLowerCase();

    if (role === "admin" || role === "owner") {
      return <Navigate to="/dashboard/org-admin" replace />;
    }

    if (role === "manager" || role === "editor") {
      return <Navigate to="/dashboard/org-editor" replace />;
    }

    if (role === "viewer" || role === "read-only") {
      return <Navigate to="/dashboard/org-viewer" replace />;
    }

    // Default to editor for organization users
    return <Navigate to="/dashboard/org-editor" replace />;
  }

  // Fallback to individual dashboard
  return <Navigate to="/dashboard/individual" replace />;
};
