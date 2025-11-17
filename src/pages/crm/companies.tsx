import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Companies = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "CRM", path: "/crm" },
      { label: "Companies", path: "/crm/companies" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Companies</h1>
      <p className="text-muted-foreground mt-2">Manage your company database</p>
      {/* Company management interface will be built here */}
    </div>
  );
};

export default Companies;
