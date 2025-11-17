import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const TimeEntries = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Projects", path: "/projects" },
      { label: "Time Tracking", path: "/projects/time-entries" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Time Tracking</h1>
      <p className="text-muted-foreground mt-2">Track time spent on projects and tasks</p>
      {/* Time tracking interface will be built here */}
    </div>
  );
};

export default TimeEntries;
