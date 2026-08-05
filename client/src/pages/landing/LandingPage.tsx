import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Printer,
  PieChart,
  Boxes,
  Building2,
  ChevronRight,
  FileCheck,
  Check,
  BookOpen,
  LayoutDashboard,
  Star,
  TrendingUp,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';

const FEATURES = [
  {
    icon: FileText,
    title: 'Smart GST Invoicing',
    description:
      'Automated CGST, SGST, IGST calculations by state code. Inclusive tax pricing, item discounts, cess, round-offs, and amount in Indian numbering words.',
    color: 'from-blue-500 to-indigo-600',
    badge: 'GST Ready',
  },
  {
    icon: FileCheck,
    title: 'Estimates & Challans',
    description:
      '1-Click conversion workflow: turn Quotations into Sales Invoices or convert Delivery Challans into final bills with instant inventory movements.',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Conversion Flow',
  },
  {
    icon: Boxes,
    title: 'Real-Time Inventory',
    description:
      'Live stock movements, valuation reports, low-stock threshold alerts, SKU generator, and instant barcode scanner integration.',
    color: 'from-amber-500 to-orange-600',
    badge: 'Stock Alerts',
  },
  {
    icon: Printer,
    title: 'A4 & Thermal Printing',
    description:
      '8 customizable print themes + 58mm/80mm thermal receipts with auto-generated UPI payment QR code for instant customer settlements.',
    color: 'from-purple-500 to-pink-600',
    badge: 'UPI QR Built-in',
  },
  {
    icon: PieChart,
    title: 'GST Returns & Analytics',
    description:
      'GSTR-1, HSN summaries, Profit & Loss reports, sales trend series, party ledger statements, and top customer analytics.',
    color: 'from-sky-500 to-blue-600',
    badge: '1-Click Export',
  },
  {
    icon: Building2,
    title: 'Multi-Company & Roles',
    description:
      'Manage multiple business units or branches with granular role-based permissions (Admin, Manager, Staff, Cashier, Accountant).',
    color: 'from-indigo-500 to-violet-600',
    badge: 'Multi-Tenant',
  },
];

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '₹299',
    period: 'per month',
    description: 'Perfect for small shops, freelancers & single user businesses.',
    features: [
      'Up to 50 Invoices / month',
      '1 Business Company',
      'Standard A4 Invoice Templates',
      'Automatic GST Tax Calculation',
      'Single User Access',
      'Customer Ledger Tracking',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Business Pro',
    price: '₹499',
    period: 'per month',
    description: 'Best for growing retail stores, distributors & GST firms.',
    features: [
      'Unlimited Invoices & Purchase Bills',
      'Up to 3 Business Companies',
      'Thermal Receipts (58mm/80mm) + 8 A4 Themes',
      'UPI Payment QR on Invoices',
      'Barcode Generator & Scanner Search',
      'GSTR-1, HSN & Financial Exports',
      'Low Stock Real-time Alerts',
    ],
    cta: 'Start 14-Day Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '₹999',
    period: 'per month',
    description: 'For multi-branch networks, wholesale trade & high volume.',
    features: [
      'Everything in Business Pro',
      'Unlimited Companies & Users',
      'Custom Role-Based Permissions',
      'Custom Branding & Print Footers',
      'Priority Support & API Access',
      'Complete Audit Log & History',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Enterprise Sales',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'This invoicing software simplified our GST billing completely. Generating invoices with UPI QR codes reduced our payment collection time by half!',
    author: 'Rajesh Sharma',
    role: 'Owner, Sharma Electronics',
    rating: 5,
  },
  {
    quote:
      'The 3D dashboard and stock movement alerts are fantastic. We manage 3 retail branches smoothly under one roof.',
    author: 'Priya Patel',
    role: 'Managing Director, Patel Traders',
    rating: 5,
  },
  {
    quote:
      'Printing thermal receipts directly from our POS system is ultra-fast. Highly recommended for any retail business in India!',
    author: 'Amit Verma',
    role: 'Founder, Verma Supermarket',
    rating: 5,
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const handleDownloadAPK = async (e: React.MouseEvent) => {
    e.preventDefault();
    const backendBase = import.meta.env.VITE_API_URL || 'https://invoice-server.onrender.com/api';
    try {
      const res = await fetch(`${backendBase}/releases/latest?platform=android`);
      const data = await res.json();
      if (data?.downloadUrl) {
        const fullUrl = data.downloadUrl.startsWith('http')
          ? data.downloadUrl
          : `${backendBase.replace(/\/api$/, '')}${data.downloadUrl}`;
        window.open(fullUrl, '_blank');
        return;
      }
    } catch {
      // Fallback
    }
    // Reliable static fallback link to downloadable release artifact
    window.open('https://github.com/pratap-ku-das/Invoice/releases/download/v1.0.4/BalajiOne-Invoice.apk', '_blank');
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white' : 'bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 px-3 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-semibold text-white shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
          <span>GST 2.0 Ready: Thermal Receipts, UPI QR & AI GST Billing Active!</span>
        </span>
      </div>

      {/* Navigation Header */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/80'
            : 'border-slate-200/80 bg-white/80 shadow-xs'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md border border-slate-200 dark:border-slate-800 shrink-0">
              <img src="/logos/app_logo.png?v=2.0" alt="BalajiOne Invoice Logo" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                BalajiOne Invoice
              </span>
              <span className="hidden sm:inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 whitespace-nowrap">
                Billing Suite
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className={`text-sm font-semibold transition ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Features
            </a>
            <a
              href="#showcase"
              className={`text-sm font-semibold transition ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Overview
            </a>
            <a
              href="#pricing"
              className={`text-sm font-semibold transition ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Pricing
            </a>
            <a
              href="#"
              onClick={handleDownloadAPK}
              className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Zap className="h-4 w-4" /> Download Android App (APK)
            </a>
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              API Docs
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>

            {user ? (
              <button
                onClick={() =>
                  navigate(
                    user.role === 'super_admin' || user.role === 'platform_owner'
                      ? '/admin/dashboard'
                      : '/app/dashboard',
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
              >
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
                    isDark ? 'text-slate-300 hover:bg-slate-900 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start Free
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-16 md:pt-24 md:pb-32">
        {/* Background Decorative Gradients */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[350px] sm:h-[500px] w-[95%] sm:w-[800px] rounded-full bg-gradient-to-br from-brand-300/40 via-indigo-200/30 to-purple-300/20 blur-3xl pointer-events-none dark:from-brand-600/20 dark:via-indigo-900/10 dark:to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-brand-700 shadow-xs dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
                <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>Next-Gen Indian Billing & GST System</span>
              </div>

              <h1 className="mt-4 sm:mt-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-snug sm:leading-[1.15]">
                Manage Invoices, Stock & Taxes in{' '}
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Stunning 3D Ease
                </span>
              </h1>

              <p
                className={`mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Create GST-compliant invoices in seconds, auto-calculate taxes by state code, 
                print thermal POS receipts, and track live inventory across multiple business branches.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to={user ? '/app' : '/register'}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-brand-600/30 transition transform hover:-translate-y-1 hover:shadow-2xl text-center"
                >
                  {user ? 'Open Dashboard' : 'Register Your Business Free'}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>

                <a
                  href="#"
                  onClick={handleDownloadAPK}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-1 text-center"
                >
                  <Zap className="h-5 w-5 text-amber-300 animate-bounce" />
                  Download Mobile App (APK)
                </a>

                <Link
                  to="/login"
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-semibold transition text-center ${
                    isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-800 shadow-md hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
                  Sign In
                </Link>
              </div>

              {/* Key Features Badges */}
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2.5 sm:gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Instant Setup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> GST & HSN Compliant
                </span>
              </div>
            </motion.div>

            {/* Right 3D Visual Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative lg:col-span-6 flex justify-center mt-4 lg:mt-0"
            >
              <div className="relative group w-full max-w-lg">
                {/* 3D Soft Ambient Glow Background */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-500/30 via-indigo-500/20 to-purple-500/30 blur-2xl opacity-75 transition duration-1000 group-hover:opacity-100" />

                {/* Main 3D Card Frame */}
                <div
                  className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border p-2 sm:p-4 shadow-2xl backdrop-blur-xl transition transform duration-500 group-hover:scale-[1.02] ${
                    isDark ? 'border-slate-800 bg-slate-900/90' : 'border-white/80 bg-white/90 shadow-slate-300/50'
                  }`}
                >
                  <img
                    src="/assets/hero_3d.png"
                    alt="Invoice 3D Billing Dashboard Mockup"
                    className="w-full rounded-xl sm:rounded-2xl object-cover shadow-lg"
                  />

                  {/* Floating 3D Stat Badge */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className={`absolute bottom-3 left-3 sm:bottom-8 sm:left-8 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-2 sm:p-4 shadow-xl backdrop-blur-md origin-bottom-left scale-90 sm:scale-100 ${
                      isDark ? 'border-slate-700 bg-slate-900/95 text-white' : 'border-slate-200 bg-white/95 text-slate-900'
                    }`}
                  >
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-400">Total Invoiced Today</div>
                      <div className="text-xs sm:text-lg font-extrabold text-emerald-600">₹1,48,900</div>
                    </div>
                  </motion.div>

                  {/* Floating 3D UPI QR Badge */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.5 }}
                    className={`absolute top-3 right-3 sm:top-8 sm:right-8 flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl border px-3 py-2 sm:px-4 sm:py-3 shadow-xl backdrop-blur-md origin-top-right scale-90 sm:scale-100 ${
                      isDark ? 'border-slate-700 bg-slate-900/95 text-white' : 'border-slate-200 bg-white/95 text-slate-900'
                    }`}
                  >
                    <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-brand-500/10 text-brand-600 border border-brand-500/20 shrink-0">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold">UPI Payment QR</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">Auto-Generated</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Showcase Banner */}
      <section className="py-12 bg-gradient-to-r from-brand-600 via-indigo-700 to-purple-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-amber-300">
                📲 BalajiOne Mobile App for Android
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Manage Invoices & Stock On The Go
              </h2>
              <p className="text-sm sm:text-base text-brand-100">
                True native Material Design 3 mobile app. Create GST invoices, view stock levels, track money in/out, and share PDF bills to WhatsApp instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <a
                href="#"
                onClick={handleDownloadAPK}
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-4 text-base font-black text-brand-700 shadow-2xl transition transform hover:-translate-y-1 hover:bg-slate-50 text-center"
              >
                <Zap className="h-6 w-6 text-brand-600 animate-bounce" />
                Download Android APK (v1.0.4)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className={`py-24 border-t ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Powerful Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything Your Business Needs to Grow Fast
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Designed specifically for Indian trade, retail shops, distributors, and GST registered enterprises.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${
                    isDark
                      ? 'border-slate-800 bg-slate-900/80 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10'
                      : 'border-slate-200 bg-white shadow-lg shadow-slate-200/50 hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.color} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">{feat.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D Interactive Showcase Section */}
      <section id="showcase" className="py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left 3D Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex justify-center"
            >
              <div className="relative group">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-brand-500/20 blur-2xl opacity-75" />
                <div
                  className={`relative overflow-hidden rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${
                    isDark ? 'border-slate-800 bg-slate-900' : 'border-white bg-white/90 shadow-slate-300/50'
                  }`}
                >
                  <img
                    src="/assets/feature_3d.png"
                    alt="3D Inventory & Tax Engine Asset"
                    className="w-full max-w-md rounded-2xl object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Bullet Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Automated Inventory & GST Engine
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Smart Stock Movements & Automated Tax Filing
              </h2>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Never worry about tax calculations or misplaced stock again. The system automatically maintains your product quantities and ledger balances in real-time.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'State-based GST logic (CGST/SGST vs IGST automatically detected)',
                  'Barcode generator and instant USB/Bluetooth scanner lookup',
                  'Thermal receipt support (58mm/80mm) with customizable UPI QR',
                  'Export GSTR-1, HSN summaries, and Profit & Loss in Excel/PDF',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-24 border-t ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Clear & Transparent Pricing
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Choose the Plan That Fits Your Growth
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              No hidden fees. Free tier available forever.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-brand-500 bg-white shadow-2xl shadow-brand-500/20 dark:bg-slate-900'
                    : isDark
                    ? 'border border-slate-800 bg-slate-900/60'
                    : 'border border-slate-200 bg-white shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1 text-xs font-extrabold text-white shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-xl font-bold">{plan.name}</div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-xs font-semibold text-slate-400">/ {plan.period}</span>
                </div>

                <ul className="mt-8 space-y-4 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <Check className="h-4 w-4 shrink-0 text-brand-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mt-8 w-full rounded-2xl py-3.5 text-center text-sm font-bold transition shadow-md ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:opacity-95 shadow-brand-500/30'
                      : isDark
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" /> Founder @ BalajiOne Enterprises & Lead Developer
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  Created & Developed by <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Pratap Kumar Das</span>
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                  <strong>BalajiOne Enterprises</strong> presents an enterprise multi-tenant GST billing, stock management, and invoice suite built by <strong>Pratap Kumar Das @ founder of BalajiOne Enterprises</strong> from Bhubaneswar, Odisha, India. Designed to empower SMEs, distributors, and service providers with high-speed automated invoicing, thermal receipt generation, and real-time inventory management.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="https://github.com/pratap-ku-das"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition backdrop-blur-md"
                  >
                    <BookOpen className="h-4 w-4 text-brand-400" />
                    GitHub: @pratap-ku-das
                  </a>
                  <div className="text-xs font-semibold text-slate-400">
                    📍 Bhubaneswar, Odisha, India
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-center">
                <div className="rounded-2xl border border-white/20 bg-slate-950/80 p-6 backdrop-blur-xl shadow-2xl text-center space-y-3 w-full max-w-xs group hover:border-brand-500/50 transition">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border-2 border-brand-400/40 shadow-glow">
                    <img
                      src="/pratap_das.png"
                      alt="Pratap Kumar Das - Founder of BalajiOne Enterprises"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Pratap Kumar Das</h3>
                    <p className="text-xs font-semibold text-brand-400">Founder @ BalajiOne Enterprises</p>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    "Building fast, reliable, and beautiful billing tools for modern businesses across India."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Trusted by 1,200+ Businesses
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              What Business Owners Say
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`rounded-3xl border p-8 transition shadow-lg ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-slate-200/50'
                }`}
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, r) => (
                    <Star key={r} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-sm">{t.author}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 ${isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}>
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-xs border border-slate-200 dark:border-slate-800">
              <img src="/logos/app_logo.png?v=2.0" alt="BalajiOne Enterprises Logo" className="h-full w-full object-contain p-0.5" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              BalajiOne Enterprises
            </span>
          </div>

          <div className="flex gap-6 text-sm font-semibold">
            <Link to="/login" className="hover:text-brand-600">Login</Link>
            <Link to="/register" className="hover:text-brand-600">Register</Link>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" className="hover:text-brand-600">
              Swagger API Docs
            </a>
          </div>

          <p className="text-xs text-slate-400 text-center sm:text-right">
            <strong className="text-slate-700 dark:text-slate-200">BalajiOne Enterprises</strong> | Developed by <strong className="text-slate-700 dark:text-slate-200">Pratap Kumar Das @ founder of BalajiOne Enterprises</strong> © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      <PWAInstallBanner />
    </div>
  );
}
