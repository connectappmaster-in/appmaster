import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Deals = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "CRM", path: "/crm" },
      { label: "Deals", path: "/crm/deals" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Deals</h1>
      <p className="text-muted-foreground mt-2">Manage your sales pipeline</p>
      {/* Deal management interface will be built here */}
    </div>
  );
};

export default Deals;
