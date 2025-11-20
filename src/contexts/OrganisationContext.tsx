import React, { createContext, useContext, useState } from 'react';

interface Organisation {
  id: string;
  name: string;
  role?: string;
}

interface OrganisationContextType {
  currentOrganisation: Organisation | null;
  setCurrentOrganisation: (org: Organisation | null) => void;
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

export const OrganisationProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentOrganisation, setCurrentOrganisation] = useState<Organisation | null>(null);

  return (
    <OrganisationContext.Provider value={{ currentOrganisation, setCurrentOrganisation }}>
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
};
