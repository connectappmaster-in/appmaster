import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Transactions = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Finance", path: "/finance" },
      { label: "Transactions", path: "/finance/transactions" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Transactions</h1>
      <p className="text-muted-foreground mt-2">Track all financial transactions</p>
      {/* Transactions interface will be built here */}
    </div>
  );
};

export default Transactions;
