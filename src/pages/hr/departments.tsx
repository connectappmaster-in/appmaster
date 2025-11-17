import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Departments = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "HR", path: "/hr" },
      { label: "Departments", path: "/hr/departments" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Departments</h1>
      <p className="text-muted-foreground mt-2">Manage organizational departments</p>
      {/* Department management interface will be built here */}
    </div>
  );
};

export default Departments;
