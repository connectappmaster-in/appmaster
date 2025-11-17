import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Target, DollarSign, TrendingUp, Clock } from "lucide-react";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Index = () => {
  const { user, setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", path: "/" }]);
  }, [setBreadcrumbs]);

  const stats = [
    {
      title: "Total Projects",
      value: "24",
      change: "+12%",
      icon: LayoutDashboard,
      trend: "up"
    },
    {
      title: "Active Leads",
      value: "156",
      change: "+8%",
      icon: Target,
      trend: "up"
    },
    {
      title: "Team Members",
      value: "42",
      change: "+3",
      icon: Users,
      trend: "up"
    },
    {
      title: "Revenue",
      value: "$52,420",
      change: "+18%",
      icon: DollarSign,
      trend: "up"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.full_name || user?.email?.split('@')[0] || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">{stat.change}</span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your team's latest updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New lead added</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Meeting scheduled</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Review quarterly reports</p>
                  <p className="text-xs text-muted-foreground">Due in 2 days</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Client presentation</p>
                  <p className="text-xs text-muted-foreground">Due tomorrow</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Team sync meeting</p>
                  <p className="text-xs text-muted-foreground">Due today</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;