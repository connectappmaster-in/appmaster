import { OrganisationsTable } from "@/components/SuperAdmin/OrganisationsTable";
const SuperAdminOrganisations = () => {
  return <div className="space-y-3">
        <div>
          
          <p className="text-sm text-muted-foreground">Manage all tenant organisations</p>
        </div>
      <OrganisationsTable />
    </div>;
};
export default SuperAdminOrganisations;