import { useState } from "react";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Package, TrendingUp, Calendar, 
  FileText, Briefcase
} from "lucide-react";

const AVAILABLE_TOOLS = [
  { key: "crm", name: "CRM", icon: Users, description: "Customer relationship management" },
  { key: "inventory", name: "Inventory", icon: Package, description: "Inventory management" },
  { key: "invoicing", name: "Invoicing", icon: FileText, description: "Invoice management" },
  { key: "assets", name: "Assets", icon: Briefcase, description: "Asset management" },
  { key: "attendance", name: "Attendance", icon: Calendar, description: "Attendance tracking" },
  { key: "subscriptions", name: "Subscriptions", icon: TrendingUp, description: "Subscription tracking" },
];

export function ToolsManagement() {
  const { organisation, refreshOrganisation } = useOrganisation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>(organisation?.active_tools || []);

  const handleToggleTool = (toolKey: string) => {
    setActiveTools(prev =>
      prev.includes(toolKey)
        ? prev.filter(k => k !== toolKey)
        : [...prev, toolKey]
    );
  };

  const handleSave = async () => {
    if (!organisation) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("organisations")
        .update({ active_tools: activeTools })
        .eq("id", organisation.id);

      if (error) throw error;

      await refreshOrganisation();
      toast({
        title: "Tools updated",
        description: "Active tools have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating tools:", error);
      toast({
        title: "Error",
        description: "Failed to update active tools.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Tools</h1>
          <p className="text-muted-foreground">
            Manage which tools are available to your organization members
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Tools</CardTitle>
          <CardDescription>
            Enable or disable tools for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {AVAILABLE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTools.includes(tool.key);

              return (
                <div
                  key={tool.key}
                  className="flex items-start space-x-4 rounded-lg border p-4"
                >
                  <div className={`rounded-lg p-2 ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={tool.key} className="text-base font-medium cursor-pointer">
                        {tool.name}
                      </Label>
                      <Switch
                        id={tool.key}
                        checked={isActive}
                        onCheckedChange={() => handleToggleTool(tool.key)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
