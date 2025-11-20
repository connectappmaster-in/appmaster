import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Navigate, Link } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { 
  Users, Ticket, Package, TrendingUp, 
  Calendar, FileText, ShoppingBag, Mail,
  DollarSign, BarChart3, Clock, Briefcase, Settings, CreditCard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrgAdminDashboard = () => {
  const { user, accountType, userRole, loading } = useAuth();
  const { organisation } = useOrganisation();

  const { data: stats } = useQuery({
    queryKey: ["org-admin-stats"],
    queryFn: async () => {
      const [leadsCount, ticketsCount, inventoryCount, usersCount] = await Promise.all([
        supabase.from("crm_leads").select("*", { count: "exact", head: true }),
        supabase.from("crm_contacts").select("*", { count: "exact", head: true }),
        supabase.from("inventory_items").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);

      return {
        leads: leadsCount.count || 0,
        tickets: ticketsCount.count || 0,
        inventory: inventoryCount.count || 0,
        users: usersCount.count || 0,
      };
    },
    enabled: !!user,
  });

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

  const activeTools = organisation?.active_tools || [];
  
  const allTools = [
    { key: "crm", name: "CRM", icon: Users, path: "/crm", color: "text-blue-500" },
    { key: "tickets", name: "Tickets", icon: Ticket, path: "/tickets", color: "text-orange-500" },
    { key: "inventory", name: "Inventory", icon: Package, path: "/inventory", color: "text-green-500" },
    { key: "attendance", name: "Attendance", icon: Calendar, path: "/attendance", color: "text-purple-500" },
    { key: "invoicing", name: "Invoicing", icon: FileText, path: "/invoicing", color: "text-yellow-500" },
    { key: "subscriptions", name: "Subscriptions", icon: TrendingUp, path: "/subscriptions", color: "text-pink-500" },
    { key: "assets", name: "Assets", icon: Briefcase, path: "/assets", color: "text-indigo-500" },
    { key: "depreciation", name: "Depreciation", icon: BarChart3, path: "/depreciation", color: "text-red-500" },
    { key: "shop", name: "Shop Income/Expense", icon: ShoppingBag, path: "/shop-income-expense", color: "text-teal-500" },
    { key: "marketing", name: "Marketing", icon: Mail, path: "/marketing", color: "text-cyan-500" },
    { key: "recruitment", name: "Recruitment", icon: Clock, path: "/recruitment", color: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{organisation?.name}</h1>
            <p className="text-muted-foreground">Organization Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/profile">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Active Users"
            value={stats?.users || 0}
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Leads"
            value={stats?.leads || 0}
            icon={TrendingUp}
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Total Contacts"
            value={stats?.tickets || 0}
            icon={Ticket}
            color="from-orange-500 to-orange-600"
          />
          <StatsCard
            title="Inventory Items"
            value={stats?.inventory || 0}
            icon={Package}
            color="from-purple-500 to-purple-600"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">{organisation?.plan || "Free"}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTools.length} active tools
                </p>
              </div>
              <Button asChild>
                <Link to="/profile">Upgrade Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allTools.map((tool) => {
              const isActive = activeTools.includes(tool.key);
              return (
                <ToolCard
                  key={tool.key}
                  name={tool.name}
                  icon={tool.icon}
                  path={tool.path}
                  color={tool.color}
                  isActive={isActive}
                  isLocked={!isActive}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
