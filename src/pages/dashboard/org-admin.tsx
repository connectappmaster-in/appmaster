import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgAdminSidebar } from "@/components/OrgAdmin/OrgAdminSidebar";
import { OrgSettings } from "@/components/OrgAdmin/OrgSettings";
import { UserManagement } from "@/components/OrgAdmin/UserManagement";
import { ToolsManagement } from "@/components/OrgAdmin/ToolsManagement";
import { BillingSettings } from "@/components/OrgAdmin/BillingSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Settings } from "lucide-react";

const SecuritySettings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Security Settings</h1>
      <p className="text-muted-foreground">
        Manage security and authentication settings
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Security settings coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const GeneralSettings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">General Settings</h1>
      <p className="text-muted-foreground">
        Additional organization settings and preferences
      </p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          General Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Additional settings coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const OrgAdminDashboard = () => {
  const { accountType, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = userRole?.toLowerCase();
  if (accountType !== "organization" || (role !== "admin" && role !== "owner")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <OrgAdminSidebar />
        
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>

          <main className="p-6">
            <Routes>
              <Route index element={<OrgSettings />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="tools" element={<ToolsManagement />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="settings" element={<GeneralSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OrgAdminDashboard;

