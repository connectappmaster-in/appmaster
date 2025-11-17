import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  Users,
  Target,
  DollarSign,
  UserPlus,
  Clock,
  FolderKanban,
  Box,
  Ticket,
  CreditCard,
  Laptop,
  Store,
  CheckCircle,
  PhoneCall,
  TrendingDown,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, module: "dashboard" },
  { 
    name: "CRM", 
    icon: Target, 
    module: "crm",
    items: [
      { name: "Companies", path: "/crm/companies" },
      { name: "Contacts", path: "/crm/contacts" },
      { name: "Leads", path: "/crm/leads" },
      { name: "Deals", path: "/crm/deals" },
    ]
  },
  { 
    name: "Finance", 
    icon: DollarSign, 
    module: "finance",
    items: [
      { name: "Accounts", path: "/finance/accounts" },
      { name: "Transactions", path: "/finance/transactions" },
      { name: "Budgets", path: "/finance/budgets" },
      { name: "Depreciation", path: "/depreciation" },
      { name: "Invoicing", path: "/invoicing" },
    ]
  },
  { 
    name: "HR", 
    icon: UserPlus, 
    module: "hr",
    items: [
      { name: "Employees", path: "/hr/employees" },
      { name: "Departments", path: "/hr/departments" },
      { name: "Leave Requests", path: "/hr/leave-requests" },
      { name: "Attendance", path: "/attendance" },
      { name: "Recruitment", path: "/recruitment" },
    ]
  },
  { 
    name: "Projects", 
    icon: FolderKanban, 
    module: "projects",
    items: [
      { name: "All Projects", path: "/projects" },
      { name: "Tasks", path: "/projects/tasks" },
      { name: "Time Tracking", path: "/projects/time-entries" },
    ]
  },
  { 
    name: "IT", 
    icon: Laptop, 
    module: "it",
    items: [
      { name: "Tickets", path: "/tickets" },
      { name: "Assets", path: "/assets" },
      { name: "Subscriptions", path: "/subscriptions" },
    ]
  },
  { 
    name: "Inventory", 
    path: "/inventory", 
    icon: Box, 
    module: "inventory" 
  },
  { name: "Shop", path: "/shop-income-expense", icon: Store, module: "shop" },
  { name: "Marketing", path: "/marketing", icon: CheckCircle, module: "marketing" },
  { name: "Personal Expense", path: "/personal-expense", icon: TrendingDown, module: "personal" },
  { name: "Contact", path: "/contact", icon: PhoneCall, module: "contact" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sidebarCollapsed, toggleSidebar, setCurrentModule } = useAppStore();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (module: string, items?: Array<{ path: string }>) => {
    if (items) {
      return items.some(item => location.pathname.startsWith(item.path));
    }
    return false;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!sidebarCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src="/appmaster-logo.png" alt="AppMaster" className="h-8 w-8" />
            <span className="font-semibold text-lg text-foreground">AppMaster</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            if (item.items) {
              const moduleActive = isModuleActive(item.module, item.items);
              return (
                <div key={item.name} className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
                      moduleActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                    )}
                    onClick={() => setCurrentModule(item.module)}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </div>
                  {!sidebarCollapsed && moduleActive && (
                    <div className="ml-4 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm",
                            isActive(subItem.path)
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/50"
                          )}
                        >
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                  isActive(item.path!)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
                onClick={() => setCurrentModule(item.module)}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Separator className="mb-3" />
        <div className="space-y-1">
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
              isActive("/profile")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Profile & Settings</span>}
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 h-auto font-medium text-sm text-muted-foreground hover:bg-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
