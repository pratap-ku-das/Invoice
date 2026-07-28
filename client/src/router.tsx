import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlatformAdminLayout } from '@/components/layout/PlatformAdminLayout';

function lazyRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const pageHasBeenReloaded = sessionStorage.getItem('page-reloaded') === 'true';
    try {
      const component = await componentImport();
      sessionStorage.removeItem('page-reloaded');
      return component;
    } catch (error) {
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('page-reloaded', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

const LandingPage = lazyRetry(() => import('@/pages/landing/LandingPage'));
const CompaniesManagement = lazyRetry(() => import('@/pages/admin/CompaniesManagement'));
const PlatformDashboard = lazyRetry(() => import('@/pages/admin/PlatformDashboard'));
const PlatformSubscriptions = lazyRetry(() => import('@/pages/admin/PlatformSubscriptions'));
const PlatformPayments = lazyRetry(() => import('@/pages/admin/PlatformPayments'));
const PlatformUsers = lazyRetry(() => import('@/pages/admin/PlatformUsers'));
const PlatformSupport = lazyRetry(() => import('@/pages/admin/PlatformSupport'));
const PlatformAnalytics = lazyRetry(() => import('@/pages/admin/PlatformAnalytics'));
const PlatformSystem = lazyRetry(() => import('@/pages/admin/PlatformSystem'));
const PlatformAuditLogs = lazyRetry(() => import('@/pages/admin/PlatformAuditLogs'));
const PlatformProfile = lazyRetry(() => import('@/pages/admin/PlatformProfile'));
const OnboardingWizard = lazyRetry(() => import('@/pages/onboarding/OnboardingWizard'));

const Login = lazyRetry(() => import('@/pages/auth/Login'));
const Register = lazyRetry(() => import('@/pages/auth/Register'));

const Dashboard = lazyRetry(() => import('@/pages/dashboard/Dashboard'));

const DocumentList = lazyRetry(() => import('@/pages/documents/DocumentList'));
const DocumentForm = lazyRetry(() => import('@/pages/documents/DocumentForm'));
const DocumentView = lazyRetry(() => import('@/pages/documents/DocumentView'));

const Customers = lazyRetry(() => import('@/pages/parties/Customers'));
const Suppliers = lazyRetry(() => import('@/pages/parties/Suppliers'));
const PartyDetail = lazyRetry(() => import('@/pages/parties/PartyDetail'));

const Products = lazyRetry(() => import('@/pages/catalog/Products'));
const Categories = lazyRetry(() => import('@/pages/catalog/Categories'));
const Units = lazyRetry(() => import('@/pages/catalog/Units'));
const PriceList = lazyRetry(() => import('@/pages/catalog/PriceList'));

const Expenses = lazyRetry(() => import('@/pages/expenses/Expenses'));
const Payments = lazyRetry(() => import('@/pages/payments/Payments'));
const Stock = lazyRetry(() => import('@/pages/stock/Stock'));
const Barcode = lazyRetry(() => import('@/pages/barcode/Barcode'));

const GstReports = lazyRetry(() => import('@/pages/reports/GstReports'));
const Reports = lazyRetry(() => import('@/pages/reports/Reports'));

const Settings = lazyRetry(() => import('@/pages/settings/Settings'));
const PrintSettings = lazyRetry(() => import('@/pages/settings/PrintSettings'));
const Plan = lazyRetry(() => import('@/pages/settings/Plan'));
const Notifications = lazyRetry(() => import('@/pages/notifications/Notifications'));

const PlatformNotifications = lazyRetry(() => import('@/pages/platform/PlatformNotifications').then(m => ({ default: m.PlatformNotifications })));
const PlatformReleases = lazyRetry(() => import('@/pages/platform/PlatformReleases').then(m => ({ default: m.PlatformReleases })));

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
  { path: 'notifications', element: <PlatformNotifications /> },
  { path: 'releases', element: <PlatformReleases /> },
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
