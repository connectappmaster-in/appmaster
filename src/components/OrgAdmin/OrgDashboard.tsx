import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OrgDashboard() {
  const { organisation } = useOrganisation();

  const { data: users } = useQuery({
    queryKey: ["org-users-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("organisation_id", organisation.id);

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const { data: subscription } = useQuery({
    queryKey: ["org-subscription-dash", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organisation_id", organisation.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const activeUsers = users?.filter(u => u.status === "active").length || 0;
  const inactiveUsers = users?.filter(u => u.status !== "active").length || 0;
  const activeTools = organisation?.active_tools?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization's key metrics and information
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeUsers} active, {inactiveUsers} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enabled for organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {subscription?.plan_name || organisation?.plan || "Free"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant={subscription?.status === "active" ? "default" : "secondary"} className="text-xs">
                {subscription?.status || "Active"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Renewal</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.renewal_date 
                ? new Date(subscription.renewal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next billing date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{organisation?.name}</div>
            </div>
            {(organisation as any)?.address && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="text-sm">{(organisation as any).address}</div>
              </div>
            )}
            {(organisation as any)?.billing_email && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Billing Email</div>
                <div className="text-sm">{(organisation as any).billing_email}</div>
              </div>
            )}
            {(organisation as any)?.gst_number && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">GST Number</div>
                <div className="text-sm">{(organisation as any).gst_number}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="/dashboard/org-admin/users"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="w-5 h-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">Add or edit team members</div>
              </div>
            </a>
            <a 
              href="/dashboard/org-admin/tools"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Wrench className="w-5 h-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Configure Tools</div>
                <div className="text-xs text-muted-foreground">Enable or disable features</div>
              </div>
            </a>
            <a 
              href="/dashboard/org-admin/billing"
              className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <TrendingUp className="w-5 h-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Billing & Plans</div>
                <div className="text-xs text-muted-foreground">Manage subscription</div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Active Tools List */}
      <Card>
        <CardHeader>
          <CardTitle>Enabled Tools</CardTitle>
          <CardDescription>
            Tools currently active for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTools > 0 ? (
            <div className="flex flex-wrap gap-2">
              {organisation?.active_tools?.map((tool) => (
                <Badge key={tool} variant="secondary" className="text-sm px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tools enabled yet</p>
              <a href="/dashboard/org-admin/tools" className="text-primary hover:underline text-sm mt-2 inline-block">
                Enable tools
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user activities in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Activity tracking coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
