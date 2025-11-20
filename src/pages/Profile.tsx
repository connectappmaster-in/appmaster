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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                // If no history, navigate to appropriate default page based on user type
                if (userType === 'appmaster_admin') {
                  navigate('/super-admin');
                } else {
                  navigate('/');
                }
              }
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your account information and security.</p>
          </div>
          {(isFetching || updateProfileMutation.isPending) && (
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving changes…
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Profile Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">PROFILE INFO</h2>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  {getInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium truncate">{formData.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {formData.email || user?.email}
                </p>
              </div>
              <div className="flex gap-2 md:ml-auto">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center">
                    {formData.name || "-"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center text-muted-foreground">
                  {formData.email || user?.email}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Email cannot be changed.</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center">
                    {formData.phone || "-"}
                  </div>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Account / Org Settings */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">ACCOUNT SETTINGS</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Role
                </Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center capitalize">
                  {userData?.role || "member"}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Shield className="w-3 h-3 rotate-90" /> Status
                </Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center capitalize">
                  {userData?.status || "active"}
                </div>
              </div>

              {!isAppmasterAdmin && (
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Organization
                  </Label>
                  <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center truncate">
                    {organisation?.name || "-"}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Member Since
                </Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center">
                  {userData?.created_at
                    ? format(new Date(userData.created_at), "MMM dd, yyyy")
                    : "-"}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Security */}
          <section className="space-y-4 pb-4">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">SECURITY</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <LockKeyhole className="w-3 h-3" /> Password
                </Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center justify-between">
                  <span>********</span>
                  <span className="text-[11px] text-muted-foreground">Managed by authentication</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Multi-factor Authentication</Label>
                <div className="h-8 px-3 rounded-md bg-muted text-sm flex items-center justify-between">
                  <span>Coming soon</span>
                  <span className="text-[11px] text-muted-foreground">Not configurable here</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
