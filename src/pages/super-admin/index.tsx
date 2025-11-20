import { Outlet, useLocation } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/SuperAdmin/SuperAdminSidebar";
import { BackButton } from "@/components/BackButton";

const routeTitles: Record<string, string> = {
  "/super-admin": "Dashboard",
  "/super-admin/users": "Individual Users",
  "/super-admin/organisations": "Organizations",
  "/super-admin/organization-users": "Organization Users",
  "/super-admin/admins": "Appmaster Admins",
  "/super-admin/api-keys": "API Keys Management",
  "/super-admin/broadcasts": "Broadcast Messages",
  "/super-admin/contact-submissions": "Contact Submissions",
  "/super-admin/features": "Feature Flags",
  "/super-admin/jobs": "Worker Jobs Monitor",
  "/super-admin/logs": "System Logs",
  "/super-admin/plans": "Subscription Plans",
  "/super-admin/settings": "System Settings",
  "/super-admin/usage": "Usage Metrics",
};

const SuperAdmin = () => {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || "Super Admin";

  return <div className="min-h-screen flex w-full">
      <BackButton />
      <SuperAdminSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center" style={{
        height: "52px"
      }}>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>

        <div className="px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default SuperAdmin;