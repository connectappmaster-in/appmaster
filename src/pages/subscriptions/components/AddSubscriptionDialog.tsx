import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Upload, CalendarIcon, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format, addMonths, addDays, isAfter, isBefore } from "date-fns";
import { cn } from "@/lib/utils";

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

const tab3Schema = z.object({
  start_date: z.date({
    required_error: "Start date is required",
  }).refine((date) => !isAfter(date, new Date()), {
    message: "Start date cannot be in the future",
  }),
  renewal_date: z.date({
    required_error: "Renewal date is required",
  }),
  contract_end_date: z.date().optional().nullable(),
  auto_renew: z.boolean(),
  reminder_days: z.number().positive("Reminder days must be positive"),
  status: z.string(),
}).refine((data) => isAfter(data.renewal_date, data.start_date), {
  message: "Renewal date must be after start date",
  path: ["renewal_date"],
}).refine((data) => !data.contract_end_date || isAfter(data.contract_end_date, data.renewal_date), {
  message: "End date must be after renewal date",
  path: ["contract_end_date"],
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
    
    // Tab 3: Dates & Renewal
    start_date: new Date() as Date | undefined,
    renewal_date: undefined as Date | undefined,
    contract_end_date: undefined as Date | undefined,
    auto_renew: true,
    reminder_days: 7,
    custom_reminder_days: "",
    status: "active",
    
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

  const validateTab3 = () => {
    try {
      tab3Schema.parse({
        start_date: formData.start_date,
        renewal_date: formData.renewal_date,
        contract_end_date: formData.contract_end_date,
        auto_renew: formData.auto_renew,
        reminder_days: formData.reminder_days === 0 ? parseInt(formData.custom_reminder_days) : formData.reminder_days,
        status: formData.status,
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
    } else if (currentTab === "dates" && validateTab3()) {
      setActiveTab("notifications");
    }
  };

  const calculateSuggestedRenewalDate = () => {
    if (!formData.start_date || !formData.billing_cycle) return null;
    
    switch (formData.billing_cycle) {
      case "monthly":
        return addMonths(formData.start_date, 1);
      case "quarterly":
        return addMonths(formData.start_date, 3);
      case "semi-annual":
        return addMonths(formData.start_date, 6);
      case "annual":
        return addMonths(formData.start_date, 12);
      default:
        return null;
    }
  };

  const getDaysUntilRenewal = () => {
    if (!formData.renewal_date) return null;
    const today = new Date();
    const renewal = new Date(formData.renewal_date);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    if (!validateTab1() || !validateTab2() || !validateTab3()) {
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
        renewal_date: formData.renewal_date?.toISOString(),
        subscription_start_date: formData.start_date?.toISOString(),
        subscription_end_date: formData.contract_end_date?.toISOString(),
        auto_renew: formData.auto_renew,
        category: formData.category,
        payment_method: formData.payment_method,
        notes: formData.notes + (formData.description ? `\n\nDescription: ${formData.description}` : ""),
        status: formData.status,
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
        start_date: new Date(),
        renewal_date: undefined,
        contract_end_date: undefined,
        auto_renew: true,
        reminder_days: 7,
        custom_reminder_days: "",
        status: "active",
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

            {/* TAB 3: DATES & RENEWAL */}
            <TabsContent value="dates" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Start Date */}
                  <div>
                    <Label htmlFor="start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.start_date && "text-muted-foreground",
                            errors.start_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date ? format(formData.start_date, "dd/MM/yyyy") : "Select date (DD/MM/YYYY)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.start_date}
                          onSelect={(date) => setFormData({ ...formData, start_date: date })}
                          disabled={(date) => isAfter(date, new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.start_date && (
                      <p className="text-sm text-destructive mt-1">{errors.start_date}</p>
                    )}
                  </div>

                  {/* Renewal Date */}
                  <div>
                    <Label htmlFor="renewal_date">
                      Next Renewal/Billing Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.renewal_date && "text-muted-foreground",
                            errors.renewal_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.renewal_date ? format(formData.renewal_date, "dd/MM/yyyy") : "Select date (DD/MM/YYYY)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.renewal_date}
                          onSelect={(date) => setFormData({ ...formData, renewal_date: date })}
                          disabled={(date) => formData.start_date ? isBefore(date, formData.start_date) : false}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">When will you be charged next?</p>
                    {errors.renewal_date && (
                      <p className="text-sm text-destructive mt-1">{errors.renewal_date}</p>
                    )}
                    {calculateSuggestedRenewalDate() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const suggested = calculateSuggestedRenewalDate();
                          if (suggested) {
                            setFormData({ ...formData, renewal_date: suggested });
                          }
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Auto-fill: {format(calculateSuggestedRenewalDate()!, "dd/MM/yyyy")}
                      </Button>
                    )}
                  </div>

                  {/* Contract End Date */}
                  <div>
                    <Label htmlFor="contract_end_date">Contract End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.contract_end_date && "text-muted-foreground",
                            errors.contract_end_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.contract_end_date ? format(formData.contract_end_date, "dd/MM/yyyy") : "Select date or leave blank"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.contract_end_date}
                          onSelect={(date) => setFormData({ ...formData, contract_end_date: date })}
                          disabled={(date) => formData.renewal_date ? isBefore(date, formData.renewal_date) : false}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">Leave blank if subscription is indefinite</p>
                    {errors.contract_end_date && (
                      <p className="text-sm text-destructive mt-1">{errors.contract_end_date}</p>
                    )}
                  </div>

                  {/* Auto-renewal Toggle */}
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto_renew">Auto-renewal</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.auto_renew 
                          ? "Subscription will auto-renew on the renewal date" 
                          : "You will need to manually renew this subscription"}
                      </p>
                    </div>
                    <Switch
                      id="auto_renew"
                      checked={formData.auto_renew}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
                    />
                  </div>

                  {/* Renewal Reminder Days */}
                  <div>
                    <Label htmlFor="reminder_days">Send Reminder Before Renewal</Label>
                    <Select
                      value={formData.reminder_days.toString()}
                      onValueChange={(value) => setFormData({ ...formData, reminder_days: parseInt(value), custom_reminder_days: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reminder period" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="7">7 days before</SelectItem>
                        <SelectItem value="14">14 days before</SelectItem>
                        <SelectItem value="30">30 days before</SelectItem>
                        <SelectItem value="1">1 day before</SelectItem>
                        <SelectItem value="0">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.reminder_days === 0 && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          placeholder="Enter custom days"
                          value={formData.custom_reminder_days}
                          onChange={(e) => setFormData({ ...formData, custom_reminder_days: e.target.value })}
                          min="1"
                          className={errors.reminder_days ? "border-destructive" : ""}
                        />
                        {errors.reminder_days && (
                          <p className="text-sm text-destructive mt-1">{errors.reminder_days}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Get notified before renewal</p>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status">Current Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">You can change this anytime</p>
                  </div>
                </div>

                {/* Timeline Visualization */}
                <div className="lg:col-span-1">
                  <div className="border rounded-lg p-4 bg-muted/30 sticky top-4">
                    <h4 className="font-semibold mb-4">Timeline</h4>
                    <div className="space-y-4">
                      {/* Today */}
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Today</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(), "dd/MM/yyyy")}</p>
                        </div>
                      </div>

                      {/* Start Date */}
                      {formData.start_date && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-xs text-muted-foreground">{format(formData.start_date, "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                      )}

                      {/* Renewal Date */}
                      {formData.renewal_date && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Renewal Date</p>
                            <p className="text-xs text-muted-foreground">{format(formData.renewal_date, "dd/MM/yyyy")}</p>
                            {getDaysUntilRenewal() !== null && (
                              <p className="text-xs font-semibold text-orange-600 mt-1">
                                {getDaysUntilRenewal()! > 0 
                                  ? `${getDaysUntilRenewal()} days until renewal` 
                                  : getDaysUntilRenewal()! === 0 
                                  ? "Renews today" 
                                  : `${Math.abs(getDaysUntilRenewal()!)} days overdue`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* End Date */}
                      {formData.contract_end_date && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p className="text-xs text-muted-foreground">{format(formData.contract_end_date, "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
