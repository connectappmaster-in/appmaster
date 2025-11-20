import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
  Save,
  LockKeyhole,
  Building2,
  Edit,
  CheckCircle2,
  Lock,
} from "lucide-react";

const Profile = () => {
  const { user, userType } = useAuth();
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAppmasterAdmin = userType === "appmaster_admin";

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const {
    data: userData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Keep local form state in sync with latest server data
  useEffect(() => {
    if (!isEditing) {
      if (userData) {
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      } else if (user) {
        setFormData({
          name: (user.user_metadata as any)?.name || user.email || "",
          email: user.email || "",
          phone: (user.user_metadata as any)?.phone || "",
        });
      }
    }
  }, [userData, isEditing, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      // Special handling for Appmaster admins: store profile info in auth metadata
      if (isAppmasterAdmin) {
        const { data: authResult, error: authError } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            phone: data.phone,
          },
        });

        if (authError) throw authError;

        // Best-effort sync phone to saas_users (ignore errors)
        if (user?.id) {
          await supabase
            .from("saas_users")
            .update({ phone: data.phone })
            .eq("auth_user_id", user.id);
        }

        const updatedUser = authResult?.user ?? user;

        return {
          name:
            ((updatedUser?.user_metadata as any)?.name as string) ||
            updatedUser?.email ||
            data.name,
          phone:
            ((updatedUser?.user_metadata as any)?.phone as string) ||
            data.phone,
          email: updatedUser?.email || "",
        };
      }

      // For regular users, update the users table
      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq("auth_user_id", user?.id)
        .select("id, name, phone, email")
        .maybeSingle();

      if (updateError) throw updateError;

      // If no existing row, create one using organisation context if available
      if (!updated) {
        const orgId = organisation?.id;

        // If no organisation (e.g. AppMaster admins), fall back to auth profile only
        if (!orgId) {
          const { data: authResult, error: authError } = await supabase.auth.updateUser({
            data: {
              name: data.name,
              phone: data.phone,
            },
          });

          if (authError) throw authError;

          if (user?.id) {
            await supabase
              .from("saas_users")
              .update({ phone: data.phone })
              .eq("auth_user_id", user.id);
          }

          const updatedUser = authResult?.user ?? user;

          return {
            name:
              ((updatedUser?.user_metadata as any)?.name as string) ||
              updatedUser?.email ||
              data.name,
            phone:
              ((updatedUser?.user_metadata as any)?.phone as string) ||
              data.phone,
            email: updatedUser?.email || "",
          };
        }

        const { data: inserted, error: insertError } = await supabase
          .from("users")
          .insert({
            auth_user_id: user?.id,
            email: user?.email || data.name, // fallback
            name: data.name,
            phone: data.phone,
            organisation_id: orgId,
            status: "active",
            role: "member",
          })
          .select("id, name, phone, email")
          .single();

        if (insertError) throw insertError;
        return inserted;
      }

      return updated;
    },
    onSuccess: async (result) => {
      // Optimistically sync cache so UI updates instantly
      queryClient.setQueryData([
        "user-profile",
        user?.id,
      ], (prev: any) => ({
        ...(prev || {}),
        name: result.name,
        phone: result.phone,
        email: result.email,
      }));

      await queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name before saving.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      name: formData.name,
      phone: formData.phone,
    });
  };

  const handleCancel = () => {
    // Reset to latest server data
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/10"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  if (userType === 'appmaster_admin') {
                    navigate('/super-admin');
                  } else {
                    navigate('/');
                  }
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your account information and security
              </p>
            </div>
            {(isFetching || updateProfileMutation.isPending) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                      {getInitials(userData?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-card rounded-full" />
                </div>
                
                <div className="w-full">
                  <h3 className="font-bold text-xl truncate">{formData.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center mt-1 gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{formData.email || user?.email}</span>
                  </p>
                </div>

                <div className="w-full pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="font-semibold capitalize text-primary text-sm">
                      {userData?.role || "Member"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="font-semibold flex items-center text-green-600 text-sm gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {userData?.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {userData?.created_at
                      ? format(new Date(userData.created_at), "MMM dd, yyyy")
                      : "-"}
                  </span>
                </div>
                {!isAppmasterAdmin && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Organization
                    </span>
                    <span className="text-sm font-medium truncate ml-2">
                      {organisation?.name || "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Info Section */}
            <div className="bg-card border border-border rounded-xl shadow-lg">
              <div className="p-6 flex items-center justify-between border-b">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update your personal details
                  </p>
                </div>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-11 bg-background"
                      />
                    ) : (
                      <div className="h-11 px-4 py-2 bg-muted/50 rounded-lg flex items-center border border-border/50">
                        <p className="text-sm">{formData.name || "-"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="h-11 bg-background"
                      />
                    ) : (
                      <div className="h-11 px-4 py-2 bg-muted/50 rounded-lg flex items-center border border-border/50">
                        <p className="text-sm">{formData.phone || "-"}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Email Address
                  </Label>
                  <div className="h-11 px-4 py-2 bg-muted/30 rounded-lg flex items-center justify-between border border-dashed">
                    <p className="text-sm">{formData.email || user?.email}</p>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Cannot be changed</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="gap-2"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-card border border-border rounded-xl shadow-lg">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account security
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3 p-5 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium">Password</Label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">••••••••</span>
                      <Button variant="ghost" size="sm" className="h-8 hover:text-primary">
                        Change
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Managed by authentication system
                    </p>
                  </div>

                  <div className="space-y-3 p-5 bg-muted/30 rounded-xl border border-border/50">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Multi-factor Authentication
                    </Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Coming soon</span>
                      <Button variant="ghost" size="sm" className="h-8" disabled>
                        Enable
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Not configurable at this time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
