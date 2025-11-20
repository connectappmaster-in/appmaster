import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Package } from "lucide-react";

export function BillingSettings() {
  const { organisation } = useOrganisation();

  const { data: subscription } = useQuery({
    queryKey: ["org-subscription", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("organisation_id", organisation.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Current Plan
            </CardTitle>
            <CardDescription>Your active subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan Name</span>
              <Badge variant="default" className="text-lg px-4 py-1">
                {subscription?.plan_name || organisation?.plan || "Free"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={subscription?.status === "active" ? "default" : "secondary"}
              >
                {subscription?.status || "Active"}
              </Badge>
            </div>
            {subscription?.renewal_date && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Renewal Date</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(subscription.renewal_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <Button className="w-full" variant="outline">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payment method added</p>
            </div>
            <Button className="w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>Features included in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">
                {organisation?.active_tools?.length || 1}
              </div>
              <div className="text-sm text-muted-foreground">Active Tools</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">Unlimited</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Storage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
