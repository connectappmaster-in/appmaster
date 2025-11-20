import { IndividualUsersTable } from "@/components/SuperAdmin/IndividualUsersTable";

const SuperAdminUsers = () => {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold">Individual Users</h2>
        <p className="text-sm text-muted-foreground">Manage individual user accounts</p>
      </div>
      <IndividualUsersTable />
    </div>
  );
};

export default SuperAdminUsers;
