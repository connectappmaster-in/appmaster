import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the request is from a super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super admin
    const { data: adminData, error: checkError } = await supabaseAdmin
      .from('appmaster_admins')
      .select('admin_role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (checkError || !adminData || !['super_admin', 'admin'].includes(adminData.admin_role)) {
      throw new Error('Unauthorized: Not a super admin');
    }

    const { name, email, password, role, organisation_id } = await req.json();

    if (!name || !email || !password || !role || !organisation_id) {
      throw new Error('Missing required fields: name, email, password, role, organisation_id');
    }

    // Validate role
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      throw new Error('Invalid role. Must be admin, editor, or viewer');
    }

    console.log(`Checking for existing user: ${email} in org: ${organisation_id}`);

    // Direct query to check for existing user, using service role to bypass RLS
    const { data: existingUsers, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id, email, organisation_id, auth_user_id')
      .ilike('email', email)
      .eq('organisation_id', organisation_id);

    console.log('Existing user check result:', { count: existingUsers?.length, existingUserError });

    if (existingUserError) {
      console.error('Error checking existing user:', existingUserError);
      throw new Error(`Error checking existing user: ${existingUserError.message}`);
    }

    // If we found existing user records
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('User record exists:', existingUser);
      
      // Check if the associated auth user still exists
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingUser.auth_user_id);
        
        if (authUser && authUser.user) {
          // Both records exist - this is a true duplicate
          throw new Error('A user with this email already exists in this organization');
        }
      } catch (authError) {
        // Auth user doesn't exist - clean up orphaned record
        console.log('Cleaning up orphaned user record (auth user not found):', existingUser.id);
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', existingUser.id);
      }
    }

    // Check if auth user exists with this email (and clean up if orphaned)
    const { data: authUserList } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUserList?.users) {
      const existingAuthUser = authUserList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingAuthUser) {
        // Check if this auth user has a corresponding users record in this org
        const { data: linkedUsers } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_user_id', existingAuthUser.id)
          .eq('organisation_id', organisation_id);
        
        if (linkedUsers && linkedUsers.length > 0) {
          // Auth user has a linked record in this org - true duplicate
          throw new Error('A user with this email already exists in this organization');
        } else {
          // Orphaned auth user - delete it
          console.log('Cleaning up orphaned auth user:', existingAuthUser.id);
          await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
        }
      }
    }

    console.log(`Creating auth user for: ${email}`);

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        organisation_id
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation');
    }

    console.log(`Auth user created: ${authData.user.id}`);
    console.log(`Inserting user record for: ${email} in org: ${organisation_id}`);

    // Create user record in users table
    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        name: name,
        email: email,
        organisation_id: organisation_id,
        user_type: 'organization',
        role: role,
        status: 'active',
      });

    if (userInsertError) {
      console.error('User insert error:', userInsertError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create user record: ${userInsertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          organisation_id: organisation_id,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
