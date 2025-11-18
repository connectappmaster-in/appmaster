const DashboardView = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Subscriptions</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
