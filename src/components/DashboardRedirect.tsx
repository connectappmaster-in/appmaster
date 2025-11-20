import { Navigate } from 'react-router-dom';
import { useOrganisation } from '@/contexts/OrganisationContext';

export const DashboardRedirect = () => {
  const { currentOrganisation } = useOrganisation();

  if (currentOrganisation) {
    return <Navigate to="/dashboard/org-admin" replace />;
  }

  return <Navigate to="/dashboard/individual" replace />;
};
