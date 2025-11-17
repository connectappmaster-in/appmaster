import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Depreciation from "./pages/depreciation";
import Invoicing from "./pages/invoicing";
import Attendance from "./pages/attendance";
import Recruitment from "./pages/recruitment";
import Tickets from "./pages/tickets";
import Subscriptions from "./pages/subscriptions";
import Assets from "./pages/assets";
import ShopIncomeExpense from "./pages/shop-income-expense";
import Inventory from "./pages/inventory";
import CRM from "./pages/crm";
import Marketing from "./pages/marketing";
import PersonalExpense from "./pages/personal-expense";
import Contact from "./pages/contact";
import Admin from "./pages/admin/index";
import Login from "./pages/Login";
import AuthConfirm from "./pages/AuthConfirm";

import Profile from "./pages/Profile";
import InitializeAdmin from "./pages/InitializeAdmin";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// CRM Pages
import CRMCompanies from "./pages/crm/companies";
import CRMContacts from "./pages/crm/contacts";
import CRMLeads from "./pages/crm/leads";
import CRMDeals from "./pages/crm/deals";

// HR Pages
import HREmployees from "./pages/hr/employees";
import HRDepartments from "./pages/hr/departments";
import HRLeaveRequests from "./pages/hr/leave-requests";

// Projects Pages
import Projects from "./pages/projects/index";
import ProjectsTasks from "./pages/projects/tasks";
import ProjectsTimeEntries from "./pages/projects/time-entries";

// Finance Pages
import FinanceAccounts from "./pages/finance/accounts";
import FinanceTransactions from "./pages/finance/transactions";
import FinanceBudgets from "./pages/finance/budgets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/confirm" element={<AuthConfirm />} />
          <Route path="/initialize-admin" element={<InitializeAdmin />} />
          
          {/* Protected routes with AppShell */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* CRM Routes */}
          <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
          <Route path="/crm/companies" element={<ProtectedRoute><CRMCompanies /></ProtectedRoute>} />
          <Route path="/crm/contacts" element={<ProtectedRoute><CRMContacts /></ProtectedRoute>} />
          <Route path="/crm/leads" element={<ProtectedRoute><CRMLeads /></ProtectedRoute>} />
          <Route path="/crm/deals" element={<ProtectedRoute><CRMDeals /></ProtectedRoute>} />
          
          {/* HR Routes */}
          <Route path="/hr/employees" element={<ProtectedRoute><HREmployees /></ProtectedRoute>} />
          <Route path="/hr/departments" element={<ProtectedRoute><HRDepartments /></ProtectedRoute>} />
          <Route path="/hr/leave-requests" element={<ProtectedRoute><HRLeaveRequests /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
          
          {/* Projects Routes */}
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/tasks" element={<ProtectedRoute><ProjectsTasks /></ProtectedRoute>} />
          <Route path="/projects/time-entries" element={<ProtectedRoute><ProjectsTimeEntries /></ProtectedRoute>} />
          
          {/* Finance Routes */}
          <Route path="/finance/accounts" element={<ProtectedRoute><FinanceAccounts /></ProtectedRoute>} />
          <Route path="/finance/transactions" element={<ProtectedRoute><FinanceTransactions /></ProtectedRoute>} />
          <Route path="/finance/budgets" element={<ProtectedRoute><FinanceBudgets /></ProtectedRoute>} />
          <Route path="/depreciation" element={<ProtectedRoute><Depreciation /></ProtectedRoute>} />
          <Route path="/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
          
          {/* IT Routes */}
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          
          {/* Other Routes */}
          <Route path="/shop-income-expense" element={<ProtectedRoute><ShopIncomeExpense /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
          <Route path="/personal-expense" element={<ProtectedRoute><PersonalExpense /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
