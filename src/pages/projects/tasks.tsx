import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Tasks = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Projects", path: "/projects" },
      { label: "Tasks", path: "/projects/tasks" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Tasks</h1>
      <p className="text-muted-foreground mt-2">Track and manage tasks</p>
      {/* Task management interface will be built here */}
    </div>
  );
};

export default Tasks;
