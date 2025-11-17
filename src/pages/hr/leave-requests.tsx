import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const LeaveRequests = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "HR", path: "/hr" },
      { label: "Leave Requests", path: "/hr/leave-requests" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Leave Requests</h1>
      <p className="text-muted-foreground mt-2">Manage employee leave requests</p>
      {/* Leave request management interface will be built here */}
    </div>
  );
};

export default LeaveRequests;
