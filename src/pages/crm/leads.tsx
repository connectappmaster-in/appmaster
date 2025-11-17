import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Leads = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "CRM", path: "/crm" },
      { label: "Leads", path: "/crm/leads" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Leads</h1>
      <p className="text-muted-foreground mt-2">Track and manage your leads</p>
      {/* Lead management interface will be built here */}
    </div>
  );
};

export default Leads;
