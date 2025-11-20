import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/SuperAdmin/StatCard";
import { 
  Building2, Users, DollarSign, TrendingUp
} from "lucide-react";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [orgsResult, usersResult, subscriptionsResult] = await Promise.all([
        supabase.from("organisations").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*").eq("status", "active"),
      ]);

      setStats({
        totalOrgs: orgsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
        monthlyRevenue: 0, // Would need to calculate from billing history
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Key metrics and system status</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organisations"
          value={stats.totalOrgs}
          icon={Building2}
          trend={{ value: "+12%", positive: true }}
          description="Active tenants"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: "+8%", positive: true }}
          description="Across all orgs"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
          description="Paying customers"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "+15%", positive: true }}
          description="This month"
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
