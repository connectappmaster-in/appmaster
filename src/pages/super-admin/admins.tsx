import { AppmasterAdminsTable } from "@/components/SuperAdmin/AppmasterAdminsTable";

const SuperAdminAdmins = () => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold">AppMaster Admins Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage global AppMaster administrators with system-wide access
        </p>
      </div>
      <AppmasterAdminsTable />
    </div>
  );
};

export default SuperAdminAdmins;
