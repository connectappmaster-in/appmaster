import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  name: string;
  description: string;
  path: string;
  icon?: React.ReactNode;
}

export const ToolCard = ({ name, description, path, icon }: ToolCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {icon && <div className="text-primary">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Link to={path}>
            <Button variant="outline" size="sm">
              Open
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
