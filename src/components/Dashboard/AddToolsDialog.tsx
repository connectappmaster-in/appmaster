import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Ticket, TrendingUp, 
  Calendar, FileText, Briefcase, LucideIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tool {
  key: string;
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
  description: string;
}

const AVAILABLE_TOOLS: Tool[] = [
  { key: "assets", name: "Assets", icon: Briefcase, path: "/assets", color: "text-indigo-500", description: "Track business assets and calculate depreciation" },
  { key: "attendance", name: "Attendance", icon: Calendar, path: "/attendance", color: "text-purple-500", description: "Employee management and attendance tracking system" },
  { key: "crm", name: "CRM", icon: Users, path: "/crm", color: "text-blue-500", description: "Manage leads, contacts, and deals in one CRM platform" },
  { key: "invoicing", name: "Invoicing", icon: FileText, path: "/invoicing", color: "text-yellow-500", description: "Create and manage professional invoices with ease" },
  { key: "tickets", name: "IT Help Desk", icon: Ticket, path: "/tickets", color: "text-orange-500", description: "Streamline customer support with ticket management" },
  { key: "subscriptions", name: "Subscriptions", icon: TrendingUp, path: "/subscriptions", color: "text-pink-500", description: "Manage recurring subscriptions and billing..." },
];

interface AddToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTools: string[];
  onToolsUpdated: (tools: string[]) => void;
}

export const AddToolsDialog = ({ open, onOpenChange, selectedTools, onToolsUpdated }: AddToolsDialogProps) => {
  const [tempSelectedTools, setTempSelectedTools] = useState<string[]>(selectedTools);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleToggleTool = (toolKey: string) => {
    setTempSelectedTools(prev => 
      prev.includes(toolKey) 
        ? prev.filter(k => k !== toolKey)
        : [...prev, toolKey]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_tools: tempSelectedTools } as any)
        .eq('id', user.id);

      if (error) throw error;

      onToolsUpdated(tempSelectedTools);
      toast({
        title: "Tools updated",
        description: "Your tool selection has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tools:', error);
      toast({
        title: "Error",
        description: "Failed to save your tool selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Tools to Your Dashboard</DialogTitle>
          <DialogDescription>
            Select the tools you want to see on your personal dashboard
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = tempSelectedTools.includes(tool.key);
              
              return (
                <div
                  key={tool.key}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => handleToggleTool(tool.key)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleTool(tool.key)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold">{tool.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Tools"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};