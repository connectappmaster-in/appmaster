import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";
import { ProfileCard } from "@/components/Profile/ProfileCard";
import { Shield, Lock, Key, Smartphone, AlertTriangle } from "lucide-react";

const Security = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <ProfileSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-normal">Security</h1>
            <p className="text-muted-foreground mt-2">
              Settings and recommendations to help you keep your account secure
            </p>
          </div>

          <div className="grid gap-6">
            <ProfileCard
              title="Password"
              description="A strong password helps prevent unauthorized access"
              icon={
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
              }
              actionLabel="Change password"
            >
              <p className="text-sm text-muted-foreground">
                Last changed: Never
              </p>
            </ProfileCard>

            <ProfileCard
              title="2-Step Verification"
              description="Add an extra layer of security to your account"
              icon={
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              }
              actionLabel="Set up 2-Step Verification"
            >
              <p className="text-sm text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Not enabled - Coming soon
              </p>
            </ProfileCard>

            <ProfileCard
              title="Recovery options"
              description="Add recovery options to regain access if you're locked out"
              icon={
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Key className="h-6 w-6 text-purple-600" />
                </div>
              }
              actionLabel="Manage recovery options"
            />

            <ProfileCard
              title="Your devices"
              description="Manage the devices you're signed in to"
              icon={
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-orange-600" />
                </div>
              }
              actionLabel="Manage devices"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
