import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Accounts = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Finance", path: "/finance" },
      { label: "Accounts", path: "/finance/accounts" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Chart of Accounts</h1>
      <p className="text-muted-foreground mt-2">Manage your accounting structure</p>
      {/* Accounts management interface will be built here */}
    </div>
  );
};

export default Accounts;
