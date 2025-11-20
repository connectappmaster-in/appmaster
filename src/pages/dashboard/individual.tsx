import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { 
  Users, Ticket, Package, TrendingUp, 
  Calendar, FileText, ShoppingBag, Mail,
  DollarSign, BarChart3, Clock, Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const IndividualDashboard = () => {
  const { user, accountType, userType, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["individual-stats"],
    queryFn: async () => {
      const [leadsCount, ticketsCount, inventoryCount] = await Promise.all([
        supabase.from("crm_leads").select("*", { count: "exact", head: true }),
        supabase.from("crm_contacts").select("*", { count: "exact", head: true }),
        supabase.from("inventory_items").select("*", { count: "exact", head: true }),
      ]);

      return {
        leads: leadsCount.count || 0,
        tickets: ticketsCount.count || 0,
        inventory: inventoryCount.count || 0,
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

  // Only redirect if accountType is explicitly set to something other than personal
  // (don't redirect while still loading or if null)
  if (accountType && accountType !== "personal" && userType !== "individual") {
    return <Navigate to="/dashboard" replace />;
  }

  const tools = [
    { key: "crm", name: "CRM", icon: Users, path: "/crm", color: "text-blue-500", isActive: true },
    { key: "tickets", name: "Tickets", icon: Ticket, path: "/tickets", color: "text-orange-500", isActive: true },
    { key: "inventory", name: "Inventory", icon: Package, path: "/inventory", color: "text-green-500", isActive: true },
    { key: "attendance", name: "Attendance", icon: Calendar, path: "/attendance", color: "text-purple-500", isActive: true },
    { key: "invoicing", name: "Invoicing", icon: FileText, path: "/invoicing", color: "text-yellow-500", isActive: true },
    { key: "subscriptions", name: "Subscriptions", icon: TrendingUp, path: "/subscriptions", color: "text-pink-500", isActive: true },
    { key: "assets", name: "Assets", icon: Briefcase, path: "/assets", color: "text-indigo-500", isActive: true },
    { key: "depreciation", name: "Depreciation", icon: BarChart3, path: "/depreciation", color: "text-red-500", isActive: true },
    { key: "shop", name: "Shop Income/Expense", icon: ShoppingBag, path: "/shop-income-expense", color: "text-teal-500", isActive: true },
    { key: "marketing", name: "Marketing", icon: Mail, path: "/marketing", color: "text-cyan-500", isActive: true },
    { key: "personal-expense", name: "Personal Expense", icon: DollarSign, path: "/personal-expense", color: "text-emerald-500", isActive: true },
    { key: "recruitment", name: "Recruitment", icon: Clock, path: "/recruitment", color: "text-violet-500", isActive: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personal Dashboard</h1>
          <p className="text-muted-foreground">Full access to all tools and features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Leads"
            value={stats?.leads || 0}
            icon={Users}
            color="from-blue-500 to-blue-600"
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
            color="from-green-500 to-green-600"
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.key}
                name={tool.name}
                icon={tool.icon}
                path={tool.path}
                color={tool.color}
                isActive={tool.isActive}
                isLocked={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
