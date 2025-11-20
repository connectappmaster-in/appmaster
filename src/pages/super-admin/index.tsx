import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/SuperAdmin/SuperAdminSidebar";
import { BackButton } from "@/components/BackButton";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || "Super Admin";
  const { user, signOut } = useAuth();

  return <div className="h-screen flex w-full overflow-hidden">
      <BackButton />
      <SuperAdminSidebar />
      
      <main className="flex-1 h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center justify-between shrink-0" style={{
        height: "52px"
      }}>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          
          <div className="flex items-center gap-2">
            {/* Notification Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Subscription upgraded</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">New organization created</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">S Admin</span>
                    <span className="text-xs text-muted-foreground">Super Admin</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default SuperAdmin;