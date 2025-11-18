import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  role?: string;
  requiredRole?: string;
}

const RoleGuard = ({ children }: RoleGuardProps) => {
  // TODO: Implement role-based access control
  return <>{children}</>;
};

export default RoleGuard;
