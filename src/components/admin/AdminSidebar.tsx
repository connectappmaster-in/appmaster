interface AdminSidebarProps {
  activeView: string;
  onViewChange?: (view: string) => void;
  setActiveView?: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ activeView, onViewChange, setActiveView, isOpen, onClose }: AdminSidebarProps) => {
  const handleViewChange = (view: string) => {
    if (onViewChange) onViewChange(view);
    if (setActiveView) setActiveView(view);
    if (onClose) onClose();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "roles", label: "Roles" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "billing", label: "Billing" },
    { id: "tools", label: "Tools Access" },
    { id: "audit", label: "Audit Logs" },
    { id: "insights", label: "Insights" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:fixed left-0 top-0 h-full w-64 bg-card border-r z-50 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
