import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/subscriptions' },
  { name: 'Tools', path: '/subscriptions/tools' },
  { name: 'Vendors', path: '/subscriptions/vendors' },
  { name: 'Licenses', path: '/subscriptions/licenses' },
  { name: 'Payments', path: '/subscriptions/payments' },
];

export const SubscriptionsSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'block px-4 py-2 rounded-md transition-colors',
              location.pathname === item.path
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};
