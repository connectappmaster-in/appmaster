import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Employees = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "HR", path: "/hr" },
      { label: "Employees", path: "/hr/employees" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Employees</h1>
      <p className="text-muted-foreground mt-2">Manage employee records</p>
      {/* Employee management interface will be built here */}
    </div>
  );
};

export default Employees;
