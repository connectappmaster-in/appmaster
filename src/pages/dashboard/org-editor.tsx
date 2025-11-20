import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Navigate } from "react-router-dom";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { 
  Users, Ticket, Package, TrendingUp, 
  Calendar, FileText, ShoppingBag, Mail,
  DollarSign, BarChart3, Clock, Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const OrgEditorDashboard = () => {
  const { user, accountType, userRole, loading } = useAuth();
  const { organisation } = useOrganisation();

  const { data: stats } = useQuery({
    queryKey: ["org-editor-stats"],
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

  const role = userRole?.toLowerCase();
  if (accountType !== "organization" || (role !== "manager" && role !== "editor" && role !== "employee")) {
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
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{organisation?.name}</h1>
          <p className="text-muted-foreground">Editor Dashboard - Operational Tools</p>
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

export default OrgEditorDashboard;
