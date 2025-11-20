import { ReactNode } from "react";
import { BroadcastBanner } from "@/components/BroadcastBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <BroadcastBanner />
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
