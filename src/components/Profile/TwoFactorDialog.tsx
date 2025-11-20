import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TwoFactorDialog = ({
  open,
  onOpenChange,
}: TwoFactorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>2-Step Verification</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              Two-factor authentication (2FA) is currently being developed and will be
              available in a future update. This feature will add an extra layer of
              security by requiring a verification code in addition to your password
              when signing in.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">What is 2-Step Verification?</h4>
              <p className="text-sm text-muted-foreground">
                2-Step Verification adds an extra layer of security to your account.
                When enabled, you'll need to provide both your password and a
                verification code from your phone to sign in.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Planned Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Authenticator app support (Google Authenticator, Authy)</li>
                <li>SMS verification codes</li>
                <li>Backup codes for account recovery</li>
                <li>Trusted device management</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
