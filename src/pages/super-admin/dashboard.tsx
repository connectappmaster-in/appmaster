import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/SuperAdmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, Users, DollarSign, TrendingUp, Activity, 
  ArrowRight, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    activeOrgs: 0,
    suspendedOrgs: 0,
  });
  const [recentOrgs, setRecentOrgs] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [orgsResult, usersResult, subscriptionsResult] = await Promise.all([
        supabase.from("organisations").select("*", { count: "exact" }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*").eq("status", "active"),
      ]);

      // Count active and suspended orgs
      const activeOrgsCount = orgsResult.data?.filter(org => org.plan !== 'suspended').length || 0;
      const suspendedOrgsCount = orgsResult.data?.filter(org => org.plan === 'suspended').length || 0;

      setStats({
        totalOrgs: orgsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
        monthlyRevenue: 0,
        activeOrgs: activeOrgsCount,
        suspendedOrgs: suspendedOrgsCount,
      });

      // Fetch recent organizations (last 5)
      const { data: recentOrgsData } = await supabase
        .from("organisations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      setRecentOrgs(recentOrgsData || []);

      // Fetch recent users (last 5)
      const { data: recentUsersData } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      setRecentUsers(recentUsersData || []);

      // Fetch recent audit logs (last 10)
      const { data: recentLogsData } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      setRecentLogs(recentLogsData || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_signup':
      case 'user_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'user_deleted':
      case 'organisation_deleted':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Key metrics and system status</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organisations"
          value={stats.totalOrgs}
          icon={Building2}
          trend={{ value: `${stats.activeOrgs} active`, positive: true }}
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

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Organizations</CardTitle>
              <CardDescription>Latest registered organizations</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/super-admin/organisations")}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentOrgs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No organizations yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={org.plan === 'free' ? 'secondary' : 'default'}>
                      {org.plan || 'free'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newest user registrations</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/super-admin/users")}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No users yet</div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.role || 'user'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Recent actions and events</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/super-admin/logs")}
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No activity logs yet</div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="mt-0.5">
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action_type.replace(/_/g, ' ')}</p>
                    {log.metadata && (
                      <p className="text-sm text-muted-foreground truncate">
                        {JSON.stringify(log.metadata).substring(0, 100)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
