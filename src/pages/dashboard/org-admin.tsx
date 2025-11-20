import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route } from "react-router-dom";
import { OrgAdminSidebar } from "@/components/OrgAdmin/OrgAdminSidebar";
import { OrgDashboard } from "@/components/OrgAdmin/OrgDashboard";
import { OrgSettings } from "@/components/OrgAdmin/OrgSettings";
import { UserManagement } from "@/components/OrgAdmin/UserManagement";
import { ToolsManagement } from "@/components/OrgAdmin/ToolsManagement";
import { BillingSettings } from "@/components/OrgAdmin/BillingSettings";
import { SecuritySettings } from "@/components/OrgAdmin/SecuritySettings";
import { GeneralSettings } from "@/components/OrgAdmin/GeneralSettings";

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
    <div className="min-h-screen flex w-full">
      <OrgAdminSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center" style={{ height: "52px" }}>
          <h1 className="text-lg font-semibold">Organization Admin</h1>
        </div>

        <div className="px-4 py-3">
          <Routes>
            <Route index element={<OrgDashboard />} />
            <Route path="info" element={<OrgSettings />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="tools" element={<ToolsManagement />} />
            <Route path="billing" element={<BillingSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="settings" element={<GeneralSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;

