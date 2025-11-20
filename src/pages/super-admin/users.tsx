import { IndividualUsersTable } from "@/components/SuperAdmin/IndividualUsersTable";
import { OrganizationUsersTable } from "@/components/SuperAdmin/OrganizationUsersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SuperAdminUsers = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual">Individual Users</TabsTrigger>
          <TabsTrigger value="organization">Organization Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4 mt-6">
          <div>
            <h2 className="text-xl font-bold">Individual Users</h2>
            <p className="text-sm text-muted-foreground">Manage individual user accounts</p>
          </div>
          <IndividualUsersTable />
        </TabsContent>
        
        <TabsContent value="organization" className="space-y-4 mt-6">
          <div>
            <h2 className="text-xl font-bold">Organization Users</h2>
            <p className="text-sm text-muted-foreground">Manage organization member accounts</p>
          </div>
          <OrganizationUsersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminUsers;
