export const DashboardHeader = ({ title }: { title: string }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  );
};
