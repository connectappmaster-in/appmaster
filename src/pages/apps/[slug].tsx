import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const AppDetailPage = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">App: {slug}</h1>
        <p className="text-muted-foreground">App details page</p>
      </div>
    </div>
  );
};

export default AppDetailPage;
