import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { AddToolsDialog } from "@/components/Dashboard/AddToolsDialog";
import { Button } from "@/components/ui/button";
import { 
  Users, Ticket, Package, TrendingUp, 
  Calendar, FileText, ShoppingBag, Mail,
  DollarSign, BarChart3, Clock, Briefcase, Plus, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const IndividualDashboard = () => {
  const { user, accountType, userType, loading } = useAuth();
  const [showAddToolsDialog, setShowAddToolsDialog] = useState(false);

  const { data: userTools, refetch: refetchTools } = useQuery({
    queryKey: ["user-tools", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      // Return empty array if selected_tools doesn't exist yet
      return (data as any)?.selected_tools || [];
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
    { key: "personal-expense", name: "Personal Expense", icon: DollarSign, path: "/personal-expense", color: "text-emerald-500" },
    { key: "recruitment", name: "Recruitment", icon: Clock, path: "/recruitment", color: "text-violet-500" },
  ];

  const displayedTools = allTools.filter(tool => userTools?.includes(tool.key));

  const handleToolsUpdated = (tools: string[]) => {
    refetchTools();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Welcome Back!
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage your business tools and track your progress all in one place
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => setShowAddToolsDialog(true)}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add My Tools
            </Button>
          </div>
        </div>


        {/* Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Tools</h2>
              <p className="text-muted-foreground">Quick access to your selected tools</p>
            </div>
          </div>

          {displayedTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedTools.map((tool) => (
                <ToolCard
                  key={tool.key}
                  name={tool.name}
                  icon={tool.icon}
                  path={tool.path}
                  color={tool.color}
                  isActive={true}
                  isLocked={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No Tools Selected Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by adding tools to your personal dashboard. Choose from our collection of business management tools.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setShowAddToolsDialog(true)}
                  className="bg-gradient-to-r from-primary to-primary-glow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Tool
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddToolsDialog
        open={showAddToolsDialog}
        onOpenChange={setShowAddToolsDialog}
        selectedTools={userTools || []}
        onToolsUpdated={handleToolsUpdated}
      />
    </div>
  );
};

export default IndividualDashboard;
