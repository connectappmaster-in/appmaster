import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas for each tab
const tab1Schema = z.object({
  subscription_name: z.string().trim().min(1, "Subscription name is required").max(100, "Max 100 characters"),
  provider_name: z.string().trim().min(1, "Provider name is required").max(100, "Max 100 characters"),
  category: z.string().min(1, "Please select a category"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Max 500 characters").optional(),
});

const tab2Schema = z.object({
  plan_name: z.string().trim().min(1, "Plan name is required").max(50, "Max 50 characters"),
  cost: z.number().positive("Cost must be greater than 0"),
  currency: z.string().min(1, "Please select a currency"),
  billing_cycle: z.string().min(1, "Please select a billing cycle"),
  cost_frequency: z.enum(["recurring", "one-time"]),
});

interface AddSubscriptionDialogProps {
  onSuccess?: () => void;
}

const COMMON_PROVIDERS = [
  "Netflix", "Amazon Prime Video", "Disney+", "Spotify", "Apple Music",
  "Adobe Creative Cloud", "Microsoft 365", "Google Workspace", "Zoom",
  "Slack", "Dropbox", "GitHub", "AWS", "Salesforce", "HubSpot",
  "Mailchimp", "Canva", "Figma", "LinkedIn Premium", "YouTube Premium"
];

const CATEGORIES = [
  "SaaS / Business Tools",
  "Streaming / Entertainment",
  "Productivity",
  "Cloud Storage",
  "Communication",
  "Security & VPN",
  "Learning & Education",
  "Payment/Finance",
  "Design & Creative",
  "Development Tools",
  "Other"
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export const AddSubscriptionDialog = ({ onSuccess }: AddSubscriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Tab 1: Basic Information
    subscription_name: "",
    provider_name: "",
    category: "",
    website: "",
    description: "",
    logo_file: null as File | null,
    
    // Tab 2: Subscription Details
    plan_name: "",
    plan_description: "",
    cost: "",
    currency: "INR",
    billing_cycle: "",
    cost_frequency: "recurring" as "recurring" | "one-time",
    
    // Tab 3: Dates & Renewal (to be implemented)
    renewal_date: "",
    start_date: "",
    
    // Tab 4: Notifications & Payment (to be implemented)
    payment_method: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [planDescLength, setPlanDescLength] = useState(0);

  const validateTab1 = () => {
    try {
      tab1Schema.parse({
        subscription_name: formData.subscription_name,
        provider_name: formData.provider_name,
        category: formData.category,
        website: formData.website || "",
        description: formData.description || "",
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateTab2 = () => {
    try {
      tab2Schema.parse({
        plan_name: formData.plan_name,
        cost: parseFloat(formData.cost),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        cost_frequency: formData.cost_frequency,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = (currentTab: string) => {
    if (currentTab === "basic" && validateTab1()) {
      setActiveTab("details");
    } else if (currentTab === "details" && validateTab2()) {
      setActiveTab("dates");
    } else if (currentTab === "dates") {
      setActiveTab("notifications");
    }
  };

  const calculateAnnualCost = () => {
    const cost = parseFloat(formData.cost) || 0;
    const currency = CURRENCIES.find(c => c.code === formData.currency)?.symbol || "₹";
    
    switch (formData.billing_cycle) {
      case "monthly":
        return `${currency}${(cost * 12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "quarterly":
        return `${currency}${(cost * 4).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "semi-annual":
        return `${currency}${(cost * 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "annual":
        return `${currency}${cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return "-";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      setFormData({ ...formData, logo_file: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all tabs before submission
    if (!validateTab1() || !validateTab2()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        subscription_name: formData.subscription_name,
        provider_name: formData.provider_name,
        cost: parseFloat(formData.cost),
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
        category: formData.category,
        payment_method: formData.payment_method,
        notes: formData.notes + (formData.description ? `\n\nDescription: ${formData.description}` : ""),
        status: "active",
        tool_id: "00000000-0000-0000-0000-000000000000",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription added successfully",
      });

      // Reset form
      setOpen(false);
      setActiveTab("basic");
      setFormData({
        subscription_name: "",
        provider_name: "",
        category: "",
        website: "",
        description: "",
        logo_file: null,
        plan_name: "",
        plan_description: "",
        cost: "",
        currency: "INR",
        billing_cycle: "",
        cost_frequency: "recurring",
        renewal_date: "",
        start_date: "",
        payment_method: "",
        notes: "",
      });
      setErrors({});
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dates">Dates</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* TAB 1: BASIC INFORMATION */}
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="subscription_name">
                  Subscription Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subscription_name"
                  placeholder="e.g., Adobe Creative Cloud"
                  value={formData.subscription_name}
                  onChange={(e) => setFormData({ ...formData, subscription_name: e.target.value })}
                  className={errors.subscription_name ? "border-destructive" : ""}
                />
                {errors.subscription_name && (
                  <p className="text-sm text-destructive mt-1">{errors.subscription_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="provider_name">
                  Provider Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.provider_name}
                  onValueChange={(value) => setFormData({ ...formData, provider_name: value })}
                >
                  <SelectTrigger className={errors.provider_name ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select or type provider name" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {COMMON_PROVIDERS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or type custom provider name"
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  className="mt-2"
                />
                {errors.provider_name && (
                  <p className="text-sm text-destructive mt-1">{errors.provider_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="--Select Category--" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Provider Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className={errors.website ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground mt-1">Provider's official website</p>
                {errors.website && (
                  <p className="text-sm text-destructive mt-1">{errors.website}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about this subscription..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setDescriptionLength(e.target.value.length);
                  }}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {descriptionLength}/500
                </p>
              </div>

              <div>
                <Label htmlFor="logo">Upload Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </Button>
                  {formData.logo_file && (
                    <span className="text-sm text-muted-foreground">
                      {formData.logo_file.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload provider's logo (optional, max 2MB)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => handleNext("basic")}>
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: SUBSCRIPTION DETAILS */}
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="plan_name">
                  Plan Name / Tier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="plan_name"
                  placeholder="e.g., Professional Annual"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  className={errors.plan_name ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Name of the specific plan (e.g., Pro, Business, Enterprise)
                </p>
                {errors.plan_name && (
                  <p className="text-sm text-destructive mt-1">{errors.plan_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="plan_description">Plan Description</Label>
                <Textarea
                  id="plan_description"
                  placeholder="Describe what's included in this plan..."
                  value={formData.plan_description}
                  onChange={(e) => {
                    setFormData({ ...formData, plan_description: e.target.value });
                    setPlanDescLength(e.target.value.length);
                  }}
                  maxLength={300}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {planDescLength}/300
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">
                    Currency <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className={errors.currency ? "border-destructive" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name} ({curr.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-destructive mt-1">{errors.currency}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cost">
                    Current Cost <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {CURRENCIES.find(c => c.code === formData.currency)?.symbol}
                    </span>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className={errors.cost ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-sm text-destructive mt-1">{errors.cost}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>
                  Is this a recurring subscription? <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.cost_frequency}
                  onValueChange={(value: "recurring" | "one-time") =>
                    setFormData({ ...formData, cost_frequency: value })
                  }
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" />
                    <Label htmlFor="recurring" className="font-normal cursor-pointer">
                      Recurring
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time" className="font-normal cursor-pointer">
                      One-time
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="billing_cycle">
                  Billing Cycle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.billing_cycle}
                  onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                  disabled={formData.cost_frequency === "one-time"}
                >
                  <SelectTrigger className={errors.billing_cycle ? "border-destructive" : ""}>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual (6 months)</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                {errors.billing_cycle && (
                  <p className="text-sm text-destructive mt-1">{errors.billing_cycle}</p>
                )}
              </div>

              {formData.cost && formData.billing_cycle && formData.cost_frequency === "recurring" && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Cost Calculation:</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      {formData.billing_cycle.charAt(0).toUpperCase() + formData.billing_cycle.slice(1)}:{" "}
                      <span className="font-semibold">
                        {CURRENCIES.find(c => c.code === formData.currency)?.symbol}
                        {parseFloat(formData.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                    <p>
                      Annual: <span className="font-semibold">{calculateAnnualCost()}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  Previous
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => handleNext("details")}>
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DATES & RENEWAL (Placeholder) */}
            <TabsContent value="dates" className="space-y-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="renewal_date">
                  Renewal Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="renewal_date"
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  Previous
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => handleNext("dates")}>
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: NOTIFICATIONS & PAYMENT (Placeholder) */}
            <TabsContent value="notifications" className="space-y-4">
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input
                  id="payment_method"
                  placeholder="e.g., Credit Card, PayPal"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("dates")}>
                  Previous
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? "Saving..." : "Save Subscription"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
