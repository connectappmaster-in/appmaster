-- ============================================================================
-- APPMASTER CORE BACKEND - PHASE 2
-- Essential tables for CRM, HR, Projects, Finance, and Communication modules
-- ============================================================================

-- ============================================================================
-- CRM MODULE
-- ============================================================================

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB,
  logo_url TEXT,
  company_size TEXT,
  annual_revenue NUMERIC,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies they created or are team members"
  ON public.companies FOR SELECT
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update companies they created"
  ON public.companies FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  address JSONB,
  social_links JSONB,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts they created or are team members"
  ON public.contacts FOR SELECT
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update contacts they created"
  ON public.contacts FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete contacts"
  ON public.contacts FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  value NUMERIC,
  currency TEXT DEFAULT 'USD',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  assigned_to UUID,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads they created or assigned to"
  ON public.leads FOR SELECT
  USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update leads they created or assigned to"
  ON public.leads FOR UPDATE
  USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'qualification',
  value NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deals they created or assigned to"
  ON public.deals FOR SELECT
  USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update deals they created or assigned to"
  ON public.deals FOR UPDATE
  USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete deals"
  ON public.deals FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- HR MODULE
-- ============================================================================

-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view departments"
  ON public.departments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  employee_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address JSONB,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation TEXT,
  employment_type TEXT,
  join_date DATE NOT NULL,
  termination_date DATE,
  salary NUMERIC,
  bank_details JSONB,
  emergency_contact JSONB,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employee record"
  ON public.employees FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage employees"
  ON public.employees FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Leave requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own leave requests"
  ON public.leave_requests FOR SELECT
  USING (
    (SELECT user_id FROM public.employees WHERE id = leave_requests.employee_id) = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Employees can create their own leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.employees WHERE id = leave_requests.employee_id) = auth.uid());

CREATE POLICY "Admins can manage all leave requests"
  ON public.leave_requests FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- PROJECTS MODULE
-- ============================================================================

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  actual_cost NUMERIC DEFAULT 0,
  progress INTEGER DEFAULT 0,
  client_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  project_manager_id UUID,
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects they created or are assigned to"
  ON public.projects FOR SELECT
  USING (
    created_by = auth.uid() 
    OR project_manager_id = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project managers can update their projects"
  ON public.projects FOR UPDATE
  USING (
    created_by = auth.uid() 
    OR project_manager_id = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  progress INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks they created or assigned to"
  ON public.tasks FOR SELECT
  USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND (projects.created_by = auth.uid() OR projects.project_manager_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tasks they created or assigned to"
  ON public.tasks FOR UPDATE
  USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Time entries table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  is_billable BOOLEAN DEFAULT true,
  hourly_rate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time entries"
  ON public.time_entries FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete their own time entries"
  ON public.time_entries FOR DELETE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- FINANCE MODULE
-- ============================================================================

-- Chart of accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  parent_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view accounts"
  ON public.accounts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage accounts"
  ON public.accounts FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT NOT NULL,
  debit_account_id UUID NOT NULL REFERENCES public.accounts(id),
  credit_account_id UUID NOT NULL REFERENCES public.accounts(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'posted',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete transactions"
  ON public.transactions FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  budget_period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  spent_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view budgets"
  ON public.budgets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage budgets"
  ON public.budgets FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- COMMUNICATION MODULE
-- ============================================================================

-- Channels table (for team communication)
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view public channels"
  ON public.channels FOR SELECT
  USING (type = 'public' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels"
  ON public.channels FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete channels"
  ON public.channels FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  sender_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in channels they have access to"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channels 
      WHERE channels.id = messages.channel_id 
      AND (channels.type = 'public' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
    )
  );

CREATE POLICY "Authenticated users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages or admins can delete any"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- CRM indexes
CREATE INDEX idx_companies_created_by ON public.companies(created_by);
CREATE INDEX idx_contacts_created_by ON public.contacts(created_by);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_leads_created_by ON public.leads(created_by);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_deals_created_by ON public.deals(created_by);
CREATE INDEX idx_deals_assigned_to ON public.deals(assigned_to);

-- HR indexes
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_department_id ON public.employees(department_id);
CREATE INDEX idx_leave_requests_employee_id ON public.leave_requests(employee_id);

-- Projects indexes
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_project_manager_id ON public.projects(project_manager_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);

-- Finance indexes
CREATE INDEX idx_transactions_created_by ON public.transactions(created_by);
CREATE INDEX idx_transactions_debit_account ON public.transactions(debit_account_id);
CREATE INDEX idx_transactions_credit_account ON public.transactions(credit_account_id);
CREATE INDEX idx_budgets_account_id ON public.budgets(account_id);

-- Communication indexes
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_channels_created_by ON public.channels(created_by);