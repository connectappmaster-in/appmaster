import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganisationProvider } from "./contexts/OrganisationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuperAdminRoute } from "./components/SuperAdminRoute";
import { DashboardRedirect } from "./components/DashboardRedirect";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import IndividualDashboard from "./pages/dashboard/individual";
import OrgAdminDashboard from "./pages/dashboard/org-admin";
import OrgEditorDashboard from "./pages/dashboard/org-editor";
import OrgViewerDashboard from "./pages/dashboard/org-viewer";
import NotFound from "./pages/NotFound";
import Depreciation from "./pages/depreciation";
import Invoicing from "./pages/invoicing";
import Attendance from "./pages/attendance";
import Recruitment from "./pages/recruitment";
import Tickets from "./pages/tickets";
import Subscriptions from "./pages/subscriptions";
import SubscriptionsDashboardPage from "./pages/subscriptions/dashboard";
import SubscriptionsToolsPage from "./pages/subscriptions/tools";
import SubscriptionsVendorsPage from "./pages/subscriptions/vendors";
import SubscriptionsLicensesPage from "./pages/subscriptions/licenses";
import SubscriptionsPaymentsPage from "./pages/subscriptions/payments";
import Assets from "./pages/assets";
import ShopIncomeExpense from "./pages/shop-income-expense";
import Inventory from "./pages/inventory";
import CRM from "./pages/crm";
import LeadsListPage from "./pages/crm/leads";
import NewLeadPage from "./pages/crm/leads/new";
import CustomersListPage from "./pages/crm/customers";
import OpportunitiesPage from "./pages/crm/opportunities";
import QuotesListPage from "./pages/crm/quotes";
import Marketing from "./pages/marketing";
import PersonalExpense from "./pages/personal-expense";
import Contact from "./pages/contact";
import Admin from "./pages/admin/index";
import Login from "./pages/Login";
import AuthConfirm from "./pages/AuthConfirm";

import Profile from "./pages/Profile";
import PersonalInfo from "./pages/profile/PersonalInfo";
import Security from "./pages/profile/Security";
import Privacy from "./pages/profile/Privacy";
import Payments from "./pages/profile/Payments";
import InitializeAdmin from "./pages/InitializeAdmin";
import PasswordReset from "./pages/PasswordReset";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import AcceptInvitation from "./pages/AcceptInvitation";
import SuperAdmin from "./pages/super-admin/index";
import SuperAdminDashboard from "./pages/super-admin/dashboard";
import SuperAdminOrganisations from "./pages/super-admin/organisations";
import SuperAdminUsers from "./pages/super-admin/users";
import SuperAdminJobs from "./pages/super-admin/jobs";
import SuperAdminAPIKeys from "./pages/super-admin/api-keys";
import SuperAdminUsage from "./pages/super-admin/usage";
import SuperAdminFeatures from "./pages/super-admin/features";
import SuperAdminPlans from "./pages/super-admin/plans";
import SuperAdminAdmins from "./pages/super-admin/admins";
import SuperAdminSettings from "./pages/super-admin/settings";
import SuperAdminLogs from "./pages/super-admin/logs";
import SuperAdminContactSubmissions from "./pages/super-admin/contact-submissions";
import SuperAdminBroadcasts from "./pages/super-admin/broadcasts";
import { BroadcastBanner } from "./components/BroadcastBanner";
import AppDetailPage from "./pages/apps/[slug]";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganisationProvider>
              <BroadcastBanner />
              <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/apps/:slug" element={<AppDetailPage />} />
                  
                  {/* Main dashboard redirect */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                  
                  {/* Individual user dashboard */}
                  <Route path="/dashboard/individual" element={<ProtectedRoute><IndividualDashboard /></ProtectedRoute>} />
                  
                  {/* Organization dashboards */}
                  <Route path="/dashboard/org-admin" element={<ProtectedRoute><OrgAdminDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/org-editor" element={<ProtectedRoute><OrgEditorDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/org-viewer" element={<ProtectedRoute><OrgViewerDashboard /></ProtectedRoute>} />
                  
                  {/* Legacy route - redirects to appropriate dashboard */}
                  <Route path="/index" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/auth/confirm" element={<AuthConfirm />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/personal-info" element={<PersonalInfo />} />
          <Route path="/profile/security" element={<Security />} />
          <Route path="/profile/payments" element={<Payments />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/initialize-admin" element={<InitializeAdmin />} />
          <Route path="/depreciation" element={<Depreciation />} />
          <Route path="/invoicing" element={<Invoicing />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/subscriptions" element={<Subscriptions />}>
            <Route index element={<SubscriptionsDashboardPage />} />
            <Route path="tools" element={<SubscriptionsToolsPage />} />
            <Route path="vendors" element={<SubscriptionsVendorsPage />} />
            <Route path="licenses" element={<SubscriptionsLicensesPage />} />
            <Route path="payments" element={<SubscriptionsPaymentsPage />} />
          </Route>
          <Route path="/assets" element={<Assets />} />
          <Route path="/shop-income-expense" element={<ShopIncomeExpense />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/crm/leads" element={<LeadsListPage />} />
          <Route path="/crm/leads/new" element={<NewLeadPage />} />
          <Route path="/crm/customers" element={<CustomersListPage />} />
          <Route path="/crm/opportunities" element={<OpportunitiesPage />} />
          <Route path="/crm/quotes" element={<QuotesListPage />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/personal-expense" element={<PersonalExpense />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="organisations" element={<SuperAdminOrganisations />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="usage" element={<SuperAdminUsage />} />
            <Route path="logs" element={<SuperAdminLogs />} />
            <Route path="features" element={<SuperAdminFeatures />} />
            <Route path="api-keys" element={<SuperAdminAPIKeys />} />
            <Route path="jobs" element={<SuperAdminJobs />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="contact-submissions" element={<SuperAdminContactSubmissions />} />
            <Route path="broadcasts" element={<SuperAdminBroadcasts />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
            </OrganisationProvider>
          </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
