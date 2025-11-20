import { UsersTable } from "@/components/SuperAdmin/UsersTable";

const SuperAdminUsers = () => {
  return (
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">Users Management</h2>
          <p className="text-sm text-muted-foreground">Manage all users across organisations</p>
        </div>
      <UsersTable />
    </div>
  );
};

export default SuperAdminUsers;
