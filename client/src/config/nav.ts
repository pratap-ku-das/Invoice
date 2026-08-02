import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Truck,
  Undo2,
  ShoppingCart,
  ClipboardList,
  PackageMinus,
  Users,
  Factory,
  Package,
  Tags,
  Ruler,
  ListOrdered,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Boxes,
  QrCode,
  Printer,
  Settings,
  BarChart3,
  PieChart,
  Gem,
  Bell,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    section: 'Main',
    items: [{ label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Invoices', to: '/app/sales/invoices', icon: FileText },
      { label: 'Estimates', to: '/app/sales/estimates', icon: FileCheck },
      { label: 'Delivery Challans', to: '/app/sales/challans', icon: Truck },
      { label: 'Sales Returns', to: '/app/sales/returns', icon: Undo2 },
      { label: 'Customers', to: '/app/customers', icon: Users },
    ],
  },
  {
    section: 'Purchase',
    items: [
      { label: 'Purchase Bills', to: '/app/purchase/bills', icon: ShoppingCart },
      { label: 'Purchase Orders', to: '/app/purchase/orders', icon: ClipboardList },
      { label: 'Purchase Returns', to: '/app/purchase/returns', icon: PackageMinus },
      { label: 'Suppliers', to: '/app/suppliers', icon: Factory },
    ],
  },
  {
    section: 'Catalog',
    items: [
      { label: 'Products', to: '/app/products', icon: Package },
      { label: 'Categories', to: '/app/categories', icon: Tags },
      { label: 'Units', to: '/app/units', icon: Ruler },
      { label: 'Price List', to: '/app/price-list', icon: ListOrdered },
    ],
  },
  {
    section: 'Money',
    items: [
      { label: 'Payments', to: '/app/payments', icon: Wallet },
      { label: 'Expenses', to: '/app/expenses', icon: Receipt },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Reports', to: '/app/reports', icon: BarChart3 },
      { label: 'GST Reports', to: '/app/gst', icon: PieChart },
      { label: 'Stock', to: '/app/stock', icon: Boxes },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Barcode', to: '/app/barcode', icon: QrCode },
      { label: 'Print Settings', to: '/app/print-settings', icon: Printer },
      { label: 'Settings', to: '/app/settings', icon: Settings },
      { label: 'Plan & Billing', to: '/app/plan', icon: Gem },
      { label: 'Help & Support', to: '/app/support', icon: LifeBuoy },
    ],
  },
  {
    section: 'Platform Admin',
    items: [
      { label: 'Push Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'App Releases', to: '/admin/releases', icon: Gem },
    ],
  },
];

export interface DocTypeMeta {
  /** server docType */
  type: string;
  title: string;
  titlePlural: string;
  route: string;
  module: 'sales' | 'purchase';
  partyType: 'customer' | 'supplier';
  partyLabel: string;
  hasPayments: boolean;
  hasDueDate: boolean;
  /** docTypes this one can convert to */
  convertsTo?: { type: string; label: string };
  statuses: string[];
}

export const DOC_TYPES: Record<string, DocTypeMeta> = {
  invoice: {
    type: 'invoice',
    title: 'Invoice',
    titlePlural: 'Invoices',
    route: '/app/sales/invoices',
    module: 'sales',
    partyType: 'customer',
    partyLabel: 'Customer',
    hasPayments: true,
    hasDueDate: true,
    statuses: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'],
  },
  estimate: {
    type: 'estimate',
    title: 'Estimate',
    titlePlural: 'Estimates',
    route: '/app/sales/estimates',
    module: 'sales',
    partyType: 'customer',
    partyLabel: 'Customer',
    hasPayments: false,
    hasDueDate: true,
    convertsTo: { type: 'invoice', label: 'Convert to Invoice' },
    statuses: ['draft', 'pending', 'accepted', 'rejected', 'expired', 'converted'],
  },
  challan: {
    type: 'challan',
    title: 'Delivery Challan',
    titlePlural: 'Delivery Challans',
    route: '/app/sales/challans',
    module: 'sales',
    partyType: 'customer',
    partyLabel: 'Customer',
    hasPayments: false,
    hasDueDate: false,
    convertsTo: { type: 'invoice', label: 'Convert to Invoice' },
    statuses: ['draft', 'pending', 'delivered', 'converted'],
  },
  'sales-return': {
    type: 'sales-return',
    title: 'Sales Return',
    titlePlural: 'Sales Returns',
    route: '/app/sales/returns',
    module: 'sales',
    partyType: 'customer',
    partyLabel: 'Customer',
    hasPayments: true,
    hasDueDate: false,
    statuses: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'],
  },
  'purchase-bill': {
    type: 'purchase-bill',
    title: 'Purchase Bill',
    titlePlural: 'Purchase Bills',
    route: '/app/purchase/bills',
    module: 'purchase',
    partyType: 'supplier',
    partyLabel: 'Supplier',
    hasPayments: true,
    hasDueDate: true,
    statuses: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'],
  },
  'purchase-order': {
    type: 'purchase-order',
    title: 'Purchase Order',
    titlePlural: 'Purchase Orders',
    route: '/app/purchase/orders',
    module: 'purchase',
    partyType: 'supplier',
    partyLabel: 'Supplier',
    hasPayments: false,
    hasDueDate: true,
    convertsTo: { type: 'purchase-bill', label: 'Convert to Bill' },
    statuses: ['draft', 'pending', 'converted', 'cancelled'],
  },
  'purchase-return': {
    type: 'purchase-return',
    title: 'Purchase Return',
    titlePlural: 'Purchase Returns',
    route: '/app/purchase/returns',
    module: 'purchase',
    partyType: 'supplier',
    partyLabel: 'Supplier',
    hasPayments: true,
    hasDueDate: false,
    statuses: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'],
  },
};

export { ArrowLeftRight };
