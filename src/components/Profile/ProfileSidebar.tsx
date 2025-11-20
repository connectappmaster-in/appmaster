import { Home, User, Shield, Lock, Users, CreditCard, Info } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Home", icon: Home, path: "/profile" },
  { title: "Personal info", icon: User, path: "/profile/personal-info" },
  { title: "Security", icon: Shield, path: "/profile/security" },
  { title: "Privacy", icon: Lock, path: "/profile/privacy" },
  { title: "People & sharing", icon: Users, path: "/profile/people" },
  { title: "Payments", icon: CreditCard, path: "/profile/payments" },
  { title: "About", icon: Info, path: "/profile/about" },
];

export const ProfileSidebar = () => {
  return (
    <aside className="w-56 bg-background border-r min-h-screen pt-4">
      <nav className="space-y-1 px-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/profile"}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-muted/50"
            )}
            activeClassName="bg-primary/10 text-primary"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
