import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const SuperAdmin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdmin;
