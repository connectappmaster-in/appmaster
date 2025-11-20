import { Smartphone, Monitor, Tablet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ManageDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageDevicesDialog = ({
  open,
  onOpenChange,
}: ManageDevicesDialogProps) => {
  const { user } = useAuth();

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android")) {
      return <Smartphone className="h-5 w-5" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android")) return "Mobile";
    if (ua.includes("tablet") || ua.includes("ipad")) return "Tablet";
    return "Desktop";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Your Devices</DialogTitle>
          <DialogDescription>
            Manage the devices where you're currently signed in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {/* Current device */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getDeviceIcon(navigator.userAgent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getDeviceType(navigator.userAgent)}</p>
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {navigator.userAgent.split(" ").slice(0, 3).join(" ")}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: Just now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              For security, sign out of any sessions you don't recognize. You can sign out of all other devices by changing your password.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
