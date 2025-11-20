import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Plus, Download, Receipt, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";

const Payments = () => {
  const { user } = useAuth();
  const { organisation } = useOrganisation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Fetch current subscription
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("organisation_id", organisation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["payment-history", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data, error } = await supabase
        .from("saas_billing_history")
        .select("*")
        .eq("organisation_id", organisation.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "paid":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "failed":
      case "expired":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ProfileSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Payments & Billing</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription, payment methods, and billing history
            </p>
          </div>

          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>Your active subscription plan and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSubscription ? (
                <div className="text-center py-8 text-muted-foreground">Loading subscription...</div>
              ) : subscription ? (
                <>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold">{subscription.plan_name}</h3>
                        <Badge className={getStatusColor(subscription.status || "")}>
                          {subscription.status || "Unknown"}
                        </Badge>
                      </div>
                      {subscription.amount && (
                        <p className="text-3xl font-bold text-primary">
                          ₹{subscription.amount}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{subscription.period || "month"}
                          </span>
                        </p>
                      )}
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscription.next_billing_date && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Next Billing Date</p>
                        <p className="font-medium">
                          {format(new Date(subscription.next_billing_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                    {subscription.renewal_date && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Renewal Date</p>
                        <p className="font-medium">
                          {format(new Date(subscription.renewal_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>

                  {subscription.subscription_plans && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium">Plan Features:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Max Users: {subscription.subscription_plans.max_users === -1 ? "Unlimited" : subscription.subscription_plans.max_users}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Max Tools: {subscription.subscription_plans.max_tools === -1 ? "Unlimited" : subscription.subscription_plans.max_tools}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active subscription found</p>
                  <Button>Subscribe Now</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Placeholder for payment methods */}
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                </div>

                <div className="text-center py-4 text-sm text-muted-foreground">
                  Add a payment method to enable automatic billing
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent transactions and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="text-center py-8 text-muted-foreground">Loading payment history...</div>
              ) : paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          payment.status === "paid" ? "bg-green-500/10" : "bg-yellow-500/10"
                        }`}>
                          {payment.status === "paid" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(new Date(payment.bill_period_start), "MMM dd")} - {format(new Date(payment.bill_period_end), "MMM dd, yyyy")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(payment.status || "")}>
                              {payment.status || "Unknown"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {payment.payment_provider || "Stripe"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">₹{payment.amount}</span>
                        {payment.invoice_url && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payments;
