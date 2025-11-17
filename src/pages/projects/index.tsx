import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const Projects = () => {
  const { setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Projects", path: "/projects" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-muted-foreground mt-2">Manage all your projects</p>
      {/* Project management interface will be built here */}
    </div>
  );
};

export default Projects;
