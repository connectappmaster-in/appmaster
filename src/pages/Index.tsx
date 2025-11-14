import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ListTodo, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const apps = [
    {
      id: "calculator",
      title: "Calculator",
      description: "A simple calculator for basic math operations",
      icon: Calculator,
      path: "/apps/calculator",
      color: "text-blue-500"
    },
    {
      id: "todo",
      title: "Todo List",
      description: "Keep track of your daily tasks",
      icon: ListTodo,
      path: "/apps/todo",
      color: "text-green-500"
    },
    {
      id: "timer",
      title: "Timer",
      description: "A countdown timer for your activities",
      icon: Timer,
      path: "/apps/timer",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">AppHub</h1>
          <p className="text-muted-foreground mt-2">Your collection of useful mini apps</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${app.color}`} />
                    <CardTitle>{app.title}</CardTitle>
                  </div>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={app.path}>
                    <Button className="w-full" variant="default">
                      Open App
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;
