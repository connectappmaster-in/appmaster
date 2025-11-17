import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Contacts = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "CRM", path: "/crm" },
      { label: "Contacts", path: "/crm/contacts" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Contacts</h1>
      <p className="text-muted-foreground mt-2">Manage your contacts</p>
      {/* Contact management interface will be built here */}
    </div>
  );
};

export default Contacts;
