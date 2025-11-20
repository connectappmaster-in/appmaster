import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Key, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SecuritySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: true,
    passwordExpiry: false,
    ipWhitelist: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Security settings have been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage security and authentication settings for your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Security
          </CardTitle>
          <CardDescription>
            Configure authentication requirements for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa" className="text-base">
                Require Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Force all users to enable 2FA for their accounts
              </p>
            </div>
            <Switch
              id="2fa"
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, twoFactorRequired: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout" className="text-base">
                Automatic Session Timeout
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out users after 30 minutes of inactivity
              </p>
            </div>
            <Switch
              id="session-timeout"
              checked={settings.sessionTimeout}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, sessionTimeout: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-expiry" className="text-base">
                Password Expiry
              </Label>
              <p className="text-sm text-muted-foreground">
                Require users to change passwords every 90 days
              </p>
            </div>
            <Switch
              id="password-expiry"
              checked={settings.passwordExpiry}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, passwordExpiry: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-whitelist" className="text-base">
                IP Whitelist
              </Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to specific IP addresses
              </p>
            </div>
            <Switch
              id="ip-whitelist"
              checked={settings.ipWhitelist}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, ipWhitelist: checked })
              }
            />
          </div>

          <Button onClick={handleSave}>Save Security Settings</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
            <CardDescription>Manage API access for integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No API keys configured</p>
              <Button variant="outline" className="mt-4">
                Generate API Key
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Monitor active user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Last activity: Just now
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <Button variant="outline" className="w-full">
                View All Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Security Audit Log
          </CardTitle>
          <CardDescription>Recent security-related events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent security events</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
