-- Fix security warnings: Add search_path to functions

-- Fix generate_invitation_token function
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Fix update_updated_at_timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;