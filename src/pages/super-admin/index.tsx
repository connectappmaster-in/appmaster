import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/SuperAdmin/SuperAdminSidebar";
import { BackButton } from "@/components/BackButton";
const SuperAdmin = () => {
  return <div className="min-h-screen flex w-full">
      <BackButton />
      <SuperAdminSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center" style={{
        height: "52px"
      }}>
          <h1 className="text-lg font-semibold">Dashboard Overview

        </h1>
        </div>

        <div className="px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default SuperAdmin;