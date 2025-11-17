import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeNameMap: Record<string, string> = {
  '/': 'Home',
  '/depreciation': 'Depreciation',
  '/invoicing': 'Invoicing',
  '/attendance': 'Attendance',
  '/recruitment': 'Recruitment',
  '/tickets': 'Tickets',
  '/subscriptions': 'Subscriptions',
  '/assets': 'Assets',
  '/shop-income-expense': 'Shop Income & Expense',
  '/inventory': 'Inventory',
  '/crm': 'CRM',
  '/marketing': 'Marketing',
  '/personal-expense': 'Personal Expense',
  '/contact': 'Contact',
  '/admin': 'Admin Panel',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/login': 'Login',
  '/initialize-admin': 'Initialize Admin',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { breadcrumbs, setBreadcrumbs } = useAppStore();

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (location.pathname === '/') {
      setBreadcrumbs([{ label: 'Home', path: '/' }]);
      return;
    }

    const crumbs = pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeNameMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      return {
        label,
        path: index === pathSegments.length - 1 ? undefined : path,
      };
    });

    setBreadcrumbs([{ label: 'Home', path: '/' }, ...crumbs]);
  }, [location.pathname, setBreadcrumbs]);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.label} className="flex items-center">
            {index > 0 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem>
              {crumb.path ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path} className="flex items-center gap-1">
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  {crumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
