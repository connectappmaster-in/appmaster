import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Shield, Edit, Trash2, UserX, UserCheck, Eye, Key, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAdminDialog } from "./EditAdminDialog";
import { ViewAdminDetailsDialog } from "./ViewAdminDetailsDialog";
import { DeleteAdminDialog } from "./DeleteAdminDialog";

export const AppmasterAdminsTable = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the security definer function that returns admin details
      const { data, error: queryError } = await supabase
        .rpc("get_appmaster_admin_details");

      if (queryError) {
        console.error("Supabase error:", queryError);
        throw queryError;
      }
      
      console.log("Fetched appmaster admins:", data);
      setAdmins(data || []);
    } catch (error: any) {
      console.error("Error fetching appmaster admins:", error);
      setError(error.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (admin: any) => {
    try {
      const { error } = await supabase
        .from('appmaster_admins')
        .update({ is_active: !admin.is_active })
        .eq('id', admin.id);

      if (error) throw error;
      
      toast.success(`Admin ${admin.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (error: any) {
      toast.error(`Failed to update admin status: ${error.message}`);
    }
  };

  const handleDeleteAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (admin: any) => {
    setSelectedAdmin(admin);
    setViewDialogOpen(true);
  };

  const handleChangeRole = (admin: any) => {
    setSelectedAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleResetPassword = async (admin: any) => {
    try {
      // This would typically send a password reset email
      toast.success(`Password reset email sent to ${admin.email}`);
      // TODO: Implement actual password reset via Supabase auth
    } catch (error: any) {
      toast.error(`Failed to send password reset: ${error.message}`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search AppMaster admins by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchAdmins} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Name
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading appmaster admins...
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No admins found matching your search" : "No appmaster admins found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeColor(admin.admin_role)} className="capitalize">
                      {admin.admin_role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {Array.isArray(admin.permissions) && admin.permissions.length > 0 
                        ? `${admin.permissions.length} custom` 
                        : "All"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.is_active ? "default" : "destructive"}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(admin)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(admin)}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                          {admin.is_active ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAdmin(admin)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <EditAdminDialog
        admin={selectedAdmin}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchAdmins}
      />
      
      <ViewAdminDetailsDialog
        admin={selectedAdmin}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <DeleteAdminDialog
        admin={selectedAdmin}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={fetchAdmins}
      />
    </div>
  );
};
