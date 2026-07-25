import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlatformAdminLayout } from '@/components/layout/PlatformAdminLayout';

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const CompaniesManagement = lazy(() => import('@/pages/admin/CompaniesManagement'));
const PlatformDashboard = lazy(() => import('@/pages/admin/PlatformDashboard'));
const PlatformSubscriptions = lazy(() => import('@/pages/admin/PlatformSubscriptions'));
const PlatformPayments = lazy(() => import('@/pages/admin/PlatformPayments'));
const PlatformUsers = lazy(() => import('@/pages/admin/PlatformUsers'));
const PlatformSupport = lazy(() => import('@/pages/admin/PlatformSupport'));
const PlatformAnalytics = lazy(() => import('@/pages/admin/PlatformAnalytics'));
const PlatformSystem = lazy(() => import('@/pages/admin/PlatformSystem'));
const PlatformAuditLogs = lazy(() => import('@/pages/admin/PlatformAuditLogs'));
const PlatformProfile = lazy(() => import('@/pages/admin/PlatformProfile'));
const OnboardingWizard = lazy(() => import('@/pages/onboarding/OnboardingWizard'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

const DocumentList = lazy(() => import('@/pages/documents/DocumentList'));
const DocumentForm = lazy(() => import('@/pages/documents/DocumentForm'));
const DocumentView = lazy(() => import('@/pages/documents/DocumentView'));

const Customers = lazy(() => import('@/pages/parties/Customers'));
const Suppliers = lazy(() => import('@/pages/parties/Suppliers'));
const PartyDetail = lazy(() => import('@/pages/parties/PartyDetail'));

const Products = lazy(() => import('@/pages/catalog/Products'));
const Categories = lazy(() => import('@/pages/catalog/Categories'));
const Units = lazy(() => import('@/pages/catalog/Units'));
const PriceList = lazy(() => import('@/pages/catalog/PriceList'));

const Expenses = lazy(() => import('@/pages/expenses/Expenses'));
const Payments = lazy(() => import('@/pages/payments/Payments'));
const Stock = lazy(() => import('@/pages/stock/Stock'));
const Barcode = lazy(() => import('@/pages/barcode/Barcode'));

const GstReports = lazy(() => import('@/pages/reports/GstReports'));
const Reports = lazy(() => import('@/pages/reports/Reports'));

const Settings = lazy(() => import('@/pages/settings/Settings'));
const PrintSettings = lazy(() => import('@/pages/settings/PrintSettings'));
const Plan = lazy(() => import('@/pages/settings/Plan'));
const Notifications = lazy(() => import('@/pages/notifications/Notifications'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function RootRoute() {
  return (
    <SuspenseWrapper>
      <LandingPage />
    </SuspenseWrapper>
  );
}

function docRoutes(docType: string, base: string) {
  return [
    { path: base, element: <DocumentList docType={docType} /> },
    { path: `${base}/new`, element: <DocumentForm docType={docType} /> },
    { path: `${base}/:id`, element: <DocumentView docType={docType} /> },
    { path: `${base}/:id/edit`, element: <DocumentForm docType={docType} /> },
  ];
}

// Company ERP Tenant Routes
const appChildren = [
  { index: true, element: <Dashboard /> },
  { path: 'dashboard', element: <Dashboard /> },

  ...docRoutes('invoice', 'sales/invoices'),
  ...docRoutes('estimate', 'sales/estimates'),
  ...docRoutes('challan', 'sales/challans'),
  ...docRoutes('sales-return', 'sales/returns'),
  ...docRoutes('purchase-bill', 'purchase/bills'),
  ...docRoutes('purchase-order', 'purchase/orders'),
  ...docRoutes('purchase-return', 'purchase/returns'),

  { path: 'customers', element: <Customers /> },
  { path: 'customers/:id', element: <PartyDetail partyType="customer" /> },
  { path: 'suppliers', element: <Suppliers /> },
  { path: 'suppliers/:id', element: <PartyDetail partyType="supplier" /> },

  { path: 'products', element: <Products /> },
  { path: 'categories', element: <Categories /> },
  { path: 'units', element: <Units /> },
  { path: 'price-list', element: <PriceList /> },

  { path: 'expenses', element: <Expenses /> },
  { path: 'payments', element: <Payments /> },
  { path: 'stock', element: <Stock /> },
  { path: 'barcode', element: <Barcode /> },

  { path: 'gst', element: <GstReports /> },
  { path: 'reports', element: <Reports /> },

  { path: 'settings', element: <Settings /> },
  { path: 'print-settings', element: <PrintSettings /> },
  { path: 'plan', element: <Plan /> },
  { path: 'notifications', element: <Notifications /> },
];

// Dedicated Platform Admin Control Panel Routes
const platformAdminChildren = [
  { index: true, element: <PlatformDashboard /> },
  { path: 'dashboard', element: <PlatformDashboard /> },
  { path: 'companies', element: <CompaniesManagement /> },
  { path: 'subscriptions', element: <PlatformSubscriptions /> },
  { path: 'payments', element: <PlatformPayments /> },
  { path: 'users', element: <PlatformUsers /> },
  { path: 'support', element: <PlatformSupport /> },
  { path: 'analytics', element: <PlatformAnalytics /> },
  { path: 'system', element: <PlatformSystem /> },
  { path: 'audit-logs', element: <PlatformAuditLogs /> },
  { path: 'profile', element: <PlatformProfile /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <RootRoute /> },
  {
    path: '/landing',
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <Register />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <SuspenseWrapper>
        <OnboardingWizard />
      </SuspenseWrapper>
    ),
  },

  // Platform Admin Control Panel Layout Routes
  {
    path: '/admin',
    element: <PlatformAdminLayout />,
    children: platformAdminChildren,
  },
  {
    path: '/app/admin',
    element: <PlatformAdminLayout />,
    children: platformAdminChildren,
  },

  // Company ERP Layout Routes
  {
    path: '/app',
    element: <AppLayout />,
    children: appChildren,
  },

  // Aliases for top-level paths
  { path: '/settings', element: <Navigate to="/app/settings" replace /> },
  { path: '/plan', element: <Navigate to="/app/plan" replace /> },
  { path: '/notifications', element: <Navigate to="/app/notifications" replace /> },
  { path: '/print-settings', element: <Navigate to="/app/print-settings" replace /> },
  { path: '/dashboard', element: <Navigate to="/app/dashboard" replace /> },

  { path: '*', element: <Navigate to="/" replace /> },
]);
