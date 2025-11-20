import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export const StatsCard = ({ title, value, description }: StatsCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </Card>
  );
};
