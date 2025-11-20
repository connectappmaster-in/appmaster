import Navbar from '@/components/Navbar';

const OrgEditorDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">Organization Editor Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your organization editor dashboard</p>
      </div>
    </div>
  );
};

export default OrgEditorDashboard;
