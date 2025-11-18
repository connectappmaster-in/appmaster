-- =====================================================================
-- A1-A6 COMPREHENSIVE SCHEMA MIGRATION
-- =====================================================================
-- Creates: auth_providers, user_sessions, subscription_plans, invitations,
-- organisation_users, announcements, team_groups, team_members
-- Fixes: profiles table structure
-- Adds: Missing RLS policies

-- =====================================================================
-- 1. AUTH_PROVIDERS - Track SSO/OAuth connections
-- =====================================================================
CREATE TABLE IF NOT EXISTS auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_oauth', 'azure_ad', 'email_password')),
  provider_user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE auth_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auth providers"
ON auth_providers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert auth providers"
ON auth_providers FOR INSERT
WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- 2. USER_SESSIONS - Track login sessions and devices
-- =====================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_time ON user_sessions(login_time DESC);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON user_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert sessions"
ON user_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
ON user_sessions FOR UPDATE
USING (user_id = auth.uid());

-- =====================================================================
-- 3. SUBSCRIPTION_PLANS - Predefined plan templates
-- =====================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  yearly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_users INTEGER NOT NULL DEFAULT 3,
  max_tools INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_plans (plan_name, display_name, description, monthly_price, yearly_price, max_users, max_tools, features, sort_order) VALUES
('free', 'Free', 'Perfect for trying out AppMaster', 0, 0, 3, 1, '["crm_basic"]'::jsonb, 1),
('starter', 'Starter', 'For small teams getting started', 999, 9990, 20, 3, '["crm_full", "tickets_full", "inventory_basic"]'::jsonb, 2),
('pro', 'Pro', 'For growing businesses', 2999, 29990, -1, -1, '["crm_full", "tickets_full", "inventory_full", "hr_full", "assets_full", "analytics"]'::jsonb, 3)
ON CONFLICT (plan_name) DO NOTHING;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
ON subscription_plans FOR SELECT
USING (is_active = true);

-- =====================================================================
-- 4. ORGANISATION_USERS - Many-to-many user-org relationship
-- =====================================================================
CREATE TABLE IF NOT EXISTS organisation_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'deactivated')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organisation_id, user_id)
);

CREATE INDEX idx_organisation_users_org ON organisation_users(organisation_id);
CREATE INDEX idx_organisation_users_user ON organisation_users(user_id);
CREATE INDEX idx_organisation_users_status ON organisation_users(status);

ALTER TABLE organisation_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships in their org"
ON organisation_users FOR SELECT
USING (
  organisation_id IN (
    SELECT organisation_id FROM users WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage org memberships"
ON organisation_users FOR ALL
USING (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

-- =====================================================================
-- 5. INVITATIONS - User invitation system
-- =====================================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_invitations_org ON invitations(organisation_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view org invitations"
ON invitations FOR SELECT
USING (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can create invitations"
ON invitations FOR INSERT
WITH CHECK (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update org invitations"
ON invitations FOR UPDATE
USING (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

-- =====================================================================
-- 6. ANNOUNCEMENTS - Organisation-wide announcements
-- =====================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_by UUID NOT NULL REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  target_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_announcements_org ON announcements(organisation_id);
CREATE INDEX idx_announcements_published ON announcements(is_published, published_at);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published announcements in their org"
ON announcements FOR SELECT
USING (
  is_published = true 
  AND organisation_id = get_user_org()
  AND (published_at IS NULL OR published_at <= now())
  AND (expires_at IS NULL OR expires_at > now())
);

CREATE POLICY "Admins can manage announcements"
ON announcements FOR ALL
USING (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  )
);

-- =====================================================================
-- 7. TEAM_GROUPS - Team-based access control
-- =====================================================================
CREATE TABLE IF NOT EXISTS team_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organisation_id, name)
);

CREATE INDEX idx_team_groups_org ON team_groups(organisation_id);

ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their org"
ON team_groups FOR SELECT
USING (organisation_id = get_user_org());

CREATE POLICY "Admins can manage teams"
ON team_groups FOR ALL
USING (
  organisation_id IN (
    SELECT u.organisation_id 
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'manager')
  )
);

-- =====================================================================
-- 8. TEAM_MEMBERS - Team membership
-- =====================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team memberships in their org"
ON team_members FOR SELECT
USING (
  team_id IN (
    SELECT id FROM team_groups WHERE organisation_id = get_user_org()
  )
);

CREATE POLICY "Managers can manage team memberships"
ON team_members FOR ALL
USING (
  team_id IN (
    SELECT tg.id 
    FROM team_groups tg
    JOIN users u ON u.organisation_id = tg.organisation_id
    JOIN user_roles ur ON ur.user_id = u.auth_user_id
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin', 'manager')
  )
);

-- =====================================================================
-- 9. FIX PROFILES TABLE - Add full_name column
-- =====================================================================
-- Add full_name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Migrate existing data from first_name + last_name to full_name
UPDATE profiles 
SET full_name = CONCAT_WS(' ', first_name, last_name)
WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Add RLS policies to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view all profiles in their tenant'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view all profiles in their tenant"
    ON profiles FOR SELECT
    USING (
      tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())';
  END IF;
END $$;

-- Add RLS policies to tenants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'Users can view their own tenant'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own tenant"
    ON tenants FOR SELECT
    USING (
      id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )';
  END IF;
END $$;

-- =====================================================================
-- 10. UPDATE SUBSCRIPTION TABLE - Link to subscription_plans
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN plan_id UUID REFERENCES subscription_plans(id);
  END IF;
END $$;

-- Migrate existing plan_name to plan_id
UPDATE subscriptions s
SET plan_id = (SELECT id FROM subscription_plans WHERE plan_name = LOWER(s.plan_name))
WHERE plan_id IS NULL;

-- =====================================================================
-- 11. CREATE HELPER FUNCTIONS
-- =====================================================================

-- Function to check if user can invite to organisation
CREATE OR REPLACE FUNCTION can_invite_user(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current user count
  SELECT COUNT(*) INTO current_count
  FROM users
  WHERE organisation_id = org_id AND status = 'active';
  
  -- Get max users from subscription
  SELECT (s.limits->>'max_users')::INTEGER INTO max_allowed
  FROM subscriptions s
  WHERE s.organisation_id = org_id AND s.status = 'active';
  
  -- If unlimited (-1), always return true
  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_allowed;
END;
$$;

-- Function to check if tool can be activated
CREATE OR REPLACE FUNCTION can_activate_tool(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current tool count
  SELECT COALESCE(array_length(active_tools, 1), 0) INTO current_count
  FROM organisations
  WHERE id = org_id;
  
  -- Get max tools from subscription
  SELECT (s.limits->>'max_tools')::INTEGER INTO max_allowed
  FROM subscriptions s
  WHERE s.organisation_id = org_id AND s.status = 'active';
  
  -- If unlimited (-1), always return true
  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_allowed;
END;
$$;

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- =====================================================================
-- 12. CREATE TRIGGERS
-- =====================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_organisation_users_timestamp ON organisation_users;
CREATE TRIGGER update_organisation_users_timestamp
BEFORE UPDATE ON organisation_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_invitations_timestamp ON invitations;
CREATE TRIGGER update_invitations_timestamp
BEFORE UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_announcements_timestamp ON announcements;
CREATE TRIGGER update_announcements_timestamp
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_team_groups_timestamp ON team_groups;
CREATE TRIGGER update_team_groups_timestamp
BEFORE UPDATE ON team_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_subscription_plans_timestamp ON subscription_plans;
CREATE TRIGGER update_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

-- Trigger to log invitation events
CREATE OR REPLACE FUNCTION log_invitation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (organisation_id, user_id, action_type, entity_type, entity_id, metadata)
    VALUES (
      NEW.organisation_id,
      NEW.invited_by,
      'invitation_created',
      'invitation',
      NEW.id::TEXT,
      jsonb_build_object('email', NEW.email, 'status', NEW.status)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (organisation_id, user_id, action_type, entity_type, entity_id, metadata)
    VALUES (
      NEW.organisation_id,
      auth.uid(),
      'invitation_status_changed',
      'invitation',
      NEW.id::TEXT,
      jsonb_build_object('email', NEW.email, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invitation_audit_trigger ON invitations;
CREATE TRIGGER invitation_audit_trigger
AFTER INSERT OR UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION log_invitation_change();