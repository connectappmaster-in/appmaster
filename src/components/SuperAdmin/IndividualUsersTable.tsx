import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Trash2, Download, Ban, CheckCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AddIndividualUserDialog } from "./AddIndividualUserDialog";

export const IndividualUsersTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get("org");

  useEffect(() => {
    fetchUsers();
  }, [orgFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("users")
        .select(`
          *,
          organisations!users_organisation_id_fkey (
            name,
            account_type
          )
        `)
        .eq("user_type", "individual");

      if (orgFilter) {
        query = query.eq("organisation_id", orgFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedUsers = (data || []).map(user => ({
        ...user,
        organisation_name: user.organisations?.name || "No Organisation",
        account_type: user.organisations?.account_type || "personal",
        global_status: user.status,
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Delete ${selectedUsers.size} user(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .in("id", Array.from(selectedUsers));
      
      if (error) throw error;
      toast.success(`Deleted ${selectedUsers.size} user(s)`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete users: " + error.message);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedUsers.size === 0) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ status })
        .in("id", Array.from(selectedUsers));
      
      if (error) throw error;
      toast.success(`Updated ${selectedUsers.size} user(s) to ${status}`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update users: " + error.message);
    }
  };

  const handleBulkExport = () => {
    const selectedUsersData = users.filter(u => selectedUsers.has(u.id));
    const csv = [
      ["Name", "Email", "Type", "Organisation", "Status", "Created"],
      ...selectedUsersData.map(u => [
        u.name || "-",
        u.email,
        u.user_type,
        u.organisation_name,
        u.status,
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `individual-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${selectedUsers.size} user(s)`);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search individual users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </div>

      <AddIndividualUserDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onUserAdded={fetchUsers}
      />

      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{selectedUsers.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("inactive")}>
              <Ban className="w-4 h-4 mr-1" />
              Disable
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("active")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Enable
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No users found matching your search" : "No individual users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name || "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="text-sm">{user.organisation_name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Update Name</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem>View Login Activity</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
