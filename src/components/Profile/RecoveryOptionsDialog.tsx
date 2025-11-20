import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Smartphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface RecoveryOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecoveryOptionsDialog = ({
  open,
  onOpenChange,
}: RecoveryOptionsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");

  const updateRecoveryEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Recovery email updated",
        description: "Check your new email for a confirmation link.",
      });
      setRecoveryEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recovery email",
        variant: "destructive",
      });
    },
  });

  const handleUpdateEmail = () => {
    if (recoveryEmail && recoveryEmail !== user?.email) {
      updateRecoveryEmailMutation.mutate(recoveryEmail);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recovery Options</DialogTitle>
          <DialogDescription>
            Add recovery options to regain access if you're locked out
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Current Email</Label>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <span className="text-sm">{user?.email}</span>
              <Badge variant="secondary" className="ml-auto">
                Primary
              </Badge>
            </div>
          </div>

          {/* Recovery Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="recoveryEmail">Recovery Email</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="recoveryEmail"
                type="email"
                placeholder="recovery@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              <Button
                onClick={handleUpdateEmail}
                disabled={
                  !recoveryEmail ||
                  recoveryEmail === user?.email ||
                  updateRecoveryEmailMutation.isPending
                }
              >
                {updateRecoveryEmailMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This email can be used to recover your account
            </p>
          </div>

          {/* Recovery Phone - Coming Soon */}
          <div className="space-y-3 opacity-60">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label>Recovery Phone Number</Label>
              <Badge variant="outline" className="ml-auto text-xs">
                Coming Soon
              </Badge>
            </div>
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              disabled
              value={recoveryPhone}
              onChange={(e) => setRecoveryPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get verification codes via SMS
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
