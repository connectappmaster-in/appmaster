import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Budgets = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Finance", path: "/finance" },
      { label: "Budgets", path: "/finance/budgets" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Budgets</h1>
      <p className="text-muted-foreground mt-2">Manage budgets and financial planning</p>
      {/* Budget management interface will be built here */}
    </div>
  );
};

export default Budgets;
