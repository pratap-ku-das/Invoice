import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Settings,
  Printer,
  Landmark,
  FileCheck,
  ShieldCheck,
  GitBranch,
  Users,
  PackagePlus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Button, Input, Select, Field } from '@/components/ui/primitives';

const BUSINESS_TYPES = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'OPC',
  'Trust',
  'NGO',
  'Individual',
];

const INDUSTRIES = [
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Grocery',
  'Pharmacy',
  'Restaurant',
  'Electronics',
  'Automobile',
  'Textile',
  'Jewellery',
  'Construction',
  'Education',
  'Healthcare',
  'Service',
  'Others',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

const SUBSCRIPTION_PLANS = [
  { id: 'free', name: 'Starter', price: '₹299/mo', users: '1 User', branches: '1 Branch', storage: '50MB' },
  { id: 'basic', name: 'Basic', price: '₹499/mo', users: '3 Users', branches: '2 Branches', storage: '1GB' },
  { id: 'pro', name: 'Pro', price: '₹999/mo', users: '10 Users', branches: '5 Branches', storage: '5GB' },
  { id: 'enterprise', name: 'Enterprise', price: '₹1999/mo', users: 'Unlimited', branches: 'Unlimited', storage: '50GB' },
];

const STEP_TITLES = [
  'Account Owner',
  'Company Profile',
  'GST & Tax',
  'Business Address',
  'Contact Details',
  'Preferences',
  'Invoice Config',
  'Bank & UPI',
  'Signature & Seal',
  'Subscription',
  'Branch Setup',
  'Staff Setup',
  'Quick Data',
  'Complete',
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State across 13 steps
  const [formData, setFormData] = useState({
    // Step 1: Owner Details
    ownerName: user?.name || '',
    ownerMobile: '',
    ownerEmail: user?.email || '',
    ownerPassword: '',
    confirmPassword: '',

    // Step 2: Company Profile
    companyName: '',
    displayName: '',
    businessType: 'Proprietorship',
    industry: 'Retail',
    description: '',
    logo: '/logos/app_logo.jpg',

    // Step 3: GST & Tax
    hasGst: false,
    gstin: '',
    pan: '',
    tan: '',
    cin: '',

    // Step 4: Business Address
    line1: '',
    line2: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    billingSame: true,

    // Step 5: Contact Information
    phone: '',
    alternateMobile: '',
    email: user?.email || '',
    website: '',
    whatsappNumber: '',

    // Step 6: Business Preferences
    financialYearStartMonth: 4, // April
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    language: 'English',

    // Step 7: Invoice Configuration
    invoicePrefix: 'INV',
    estimatePrefix: 'EST',
    purchasePrefix: 'PUR',
    creditNotePrefix: 'CN',
    debitNotePrefix: 'DN',
    invoiceStartNumber: 1001,
    defaultTaxType: 'exclusive', // inclusive | exclusive
    paperSize: 'A4', // A4 | A5 | thermal-58 | thermal-80
    template: 'modern',

    // Step 8: Bank & UPI
    accountName: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
    qrCode: '',

    // Step 9: Signature & Seal
    signature: '',
    seal: '',

    // Step 10: Subscription
    plan: 'free',

    // Step 11: Branch Setup
    branchName: 'Head Office',
    branchCode: 'HO01',
    branchPhone: '',

    // Step 12: Staff Setup
    staffName: '',
    staffEmail: '',
    staffMobile: '',
    staffRole: 'sales',

    // Step 13: Initial Quick Setup
    customerName: '',
    customerPhone: '',
    supplierName: '',
    supplierGst: '',
    productName: '',
    productPrice: '',
    productUnit: 'PCS',
    productGstRate: 18,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto fill PAN when GSTIN is typed
  useEffect(() => {
    if (formData.gstin && formData.gstin.length >= 12) {
      const panPart = formData.gstin.substring(2, 12).toUpperCase();
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panPart)) {
        handleChange('pan', panPart);
      }
    }
  }, [formData.gstin]);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.ownerName.trim()) {
        toast.error('Owner Name is required');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.companyName.trim()) {
        toast.error('Company Name is required');
        return false;
      }
    }
    if (step === 3 && formData.hasGst) {
      if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
        toast.error('Invalid GSTIN Format (e.g. 27AAAAA0000A1Z5)');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 14) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Save company profile & settings
      await api.post('/company/onboarding', {
        name: formData.companyName,
        displayName: formData.displayName || formData.companyName,
        businessType: formData.businessType,
        industry: formData.industry,
        description: formData.description,
        logo: formData.logo,

        hasGst: formData.hasGst,
        gstin: formData.gstin,
        pan: formData.pan,
        tan: formData.tan,
        cin: formData.cin,

        phone: formData.phone || formData.ownerMobile,
        alternateMobile: formData.alternateMobile,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        website: formData.website,

        address: {
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        district: formData.district,

        bank: {
          accountName: formData.accountName,
          bankName: formData.bankName,
          branch: formData.branch,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
        },
        upiId: formData.upiId,
        signature: formData.signature,
        seal: formData.seal,

        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        financialYearStartMonth: formData.financialYearStartMonth,
        timezone: formData.timezone,
        language: formData.language,

        printSettings: {
          paperSize: formData.paperSize,
          theme: formData.template,
          showLogo: true,
          showSignature: !!formData.signature,
          showBankDetails: !!formData.accountNumber,
          showUpiQr: !!formData.upiId,
        },

        subscription: {
          plan: formData.plan,
          status: 'active',
        },

        isOnboardingCompleted: true,
      });

      // 2. Save Sequence Prefix Settings
      await api.patch('/company/sequences/invoice', { prefix: formData.invoicePrefix, nextNumber: Number(formData.invoiceStartNumber) });
      await api.patch('/company/sequences/estimate', { prefix: formData.estimatePrefix });
      await api.patch('/company/sequences/purchase-bill', { prefix: formData.purchasePrefix });
      await api.patch('/company/sequences/sales-return', { prefix: formData.creditNotePrefix });
      await api.patch('/company/sequences/purchase-return', { prefix: formData.debitNotePrefix });

      // 3. Quick Data Seeding if provided
      if (formData.customerName) {
        await api.post('/customers', { name: formData.customerName, phone: formData.customerPhone }).catch(() => {});
      }
      if (formData.supplierName) {
        await api.post('/suppliers', { name: formData.supplierName, gstin: formData.supplierGst }).catch(() => {});
      }
      if (formData.productName) {
        await api.post('/products', {
          name: formData.productName,
          sellingPrice: Number(formData.productPrice) || 100,
          taxRate: Number(formData.productGstRate) || 18,
          itemType: 'product',
        }).catch(() => {});
      }

      toast.success('Onboarding complete! Welcome to BalajiOne Invoice.');
      navigate('/app');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-xs border border-slate-200 dark:border-slate-800">
              <img src="/logos/app_logo.jpg" alt="Logo" className="h-full w-full object-contain p-0.5" />
            </div>
            <div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                BalajiOne Invoice
              </span>
              <span className="ml-2 text-xs font-semibold text-slate-400">Onboarding Wizard</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Step {currentStep} of 14: <span className="text-brand-600">{STEP_TITLES[currentStep - 1]}</span>
          </div>
        </div>
      </header>

      {/* Progress Step Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5">
        <motion.div
          className="bg-gradient-to-r from-brand-600 to-indigo-600 h-1.5"
          animate={{ width: `${(currentStep / 14) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Form Content */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Step 1: Owner Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 1: Account Owner (Super Admin)</h2>
                    <p className="text-xs text-slate-500">Configure owner profile & contact preferences</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <Input value={formData.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} placeholder="Rajesh Kumar" />
                  </Field>
                  <Field label="Mobile Number" required>
                    <Input value={formData.ownerMobile} onChange={(e) => handleChange('ownerMobile', e.target.value)} placeholder="9876543210" />
                  </Field>
                  <Field label="Email Address" required>
                    <Input type="email" value={formData.ownerEmail} onChange={(e) => handleChange('ownerEmail', e.target.value)} placeholder="rajesh@business.com" />
                  </Field>
                  <Field label="Password">
                    <Input type="password" value={formData.ownerPassword} onChange={(e) => handleChange('ownerPassword', e.target.value)} placeholder="••••••••" />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 2: Company Information</h2>
                    <p className="text-xs text-slate-500">Basic details about your business entity</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Company Legal Name" required>
                    <Input value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} placeholder="BalajiOne Enterprises Pvt Ltd" />
                  </Field>
                  <Field label="Business Display Name">
                    <Input value={formData.displayName} onChange={(e) => handleChange('displayName', e.target.value)} placeholder="BalajiOne Invoice" />
                  </Field>
                  <Field label="Business Type">
                    <Select value={formData.businessType} onChange={(e) => handleChange('businessType', e.target.value)}>
                      {BUSINESS_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Industry Sector">
                    <Select value={formData.industry} onChange={(e) => handleChange('industry', e.target.value)}>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Company Description">
                  <Input value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Leading distributor of quality products..." />
                </Field>
              </div>
            )}

            {/* Step 3: GST & Tax Details */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 3: GST & Tax Registrations</h2>
                    <p className="text-xs text-slate-500">Enable automatic GST tax calculations for invoices</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4 border-slate-200 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="hasGst"
                    checked={formData.hasGst}
                    onChange={(e) => handleChange('hasGst', e.target.checked)}
                    className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="hasGst" className="text-sm font-bold cursor-pointer">
                    My business is registered under GST
                  </label>
                </div>

                {formData.hasGst && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <Field label="GSTIN Number">
                      <Input
                        value={formData.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        maxLength={15}
                      />
                    </Field>
                    <Field label="PAN Number">
                      <Input
                        value={formData.pan}
                        onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                        placeholder="AAAAA0000A"
                        maxLength={10}
                      />
                    </Field>
                    <Field label="TAN Number (Optional)">
                      <Input value={formData.tan} onChange={(e) => handleChange('tan', e.target.value.toUpperCase())} placeholder="MUMB12345C" />
                    </Field>
                    <Field label="CIN Number (Optional)">
                      <Input value={formData.cin} onChange={(e) => handleChange('cin', e.target.value.toUpperCase())} placeholder="U12345MH2024PTC123456" />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Business Address */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 4: Business Address</h2>
                    <p className="text-xs text-slate-500">Registered workplace & office address</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Address Line 1">
                    <Input value={formData.line1} onChange={(e) => handleChange('line1', e.target.value)} placeholder="Shop No. 12, Commercial Complex" />
                  </Field>
                  <Field label="Address Line 2">
                    <Input value={formData.line2} onChange={(e) => handleChange('line2', e.target.value)} placeholder="MG Road, Industrial Estate" />
                  </Field>
                  <Field label="City">
                    <Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Mumbai" />
                  </Field>
                  <Field label="District">
                    <Input value={formData.district} onChange={(e) => handleChange('district', e.target.value)} placeholder="Mumbai Suburban" />
                  </Field>
                  <Field label="State">
                    <Select value={formData.state} onChange={(e) => handleChange('state', e.target.value)}>
                      {STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Pincode">
                    <Input value={formData.pincode} onChange={(e) => handleChange('pincode', e.target.value)} placeholder="400001" maxLength={6} />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 5: Contact Information */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 5: Contact Information</h2>
                    <p className="text-xs text-slate-500">Primary phone, WhatsApp & email details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Primary Mobile">
                    <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="9876543210" />
                  </Field>
                  <Field label="WhatsApp Number">
                    <Input value={formData.whatsappNumber} onChange={(e) => handleChange('whatsappNumber', e.target.value)} placeholder="9876543210" />
                  </Field>
                  <Field label="Alternate Phone">
                    <Input value={formData.alternateMobile} onChange={(e) => handleChange('alternateMobile', e.target.value)} placeholder="022-28491000" />
                  </Field>
                  <Field label="Official Website">
                    <Input value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://mybusiness.com" />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 6: Preferences */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 6: Business Preferences</h2>
                    <p className="text-xs text-slate-500">Financial year & localization settings</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Financial Year Start">
                    <Select value={formData.financialYearStartMonth} onChange={(e) => handleChange('financialYearStartMonth', Number(e.target.value))}>
                      <option value={4}>April – March (India standard)</option>
                      <option value={1}>January – December</option>
                    </Select>
                  </Field>
                  <Field label="Base Currency">
                    <Input value="INR (₹)" disabled />
                  </Field>
                  <Field label="Time Zone">
                    <Input value={formData.timezone} onChange={(e) => handleChange('timezone', e.target.value)} />
                  </Field>
                  <Field label="System Language">
                    <Input value={formData.language} onChange={(e) => handleChange('language', e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 7: Invoice Configuration */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 7: Invoice & Print Configuration</h2>
                    <p className="text-xs text-slate-500">Sequence prefixes, template style & paper size</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Invoice Prefix">
                    <Input value={formData.invoicePrefix} onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())} placeholder="INV" />
                  </Field>
                  <Field label="Estimate Prefix">
                    <Input value={formData.estimatePrefix} onChange={(e) => handleChange('estimatePrefix', e.target.value.toUpperCase())} placeholder="EST" />
                  </Field>
                  <Field label="Purchase Bill Prefix">
                    <Input value={formData.purchasePrefix} onChange={(e) => handleChange('purchasePrefix', e.target.value.toUpperCase())} placeholder="PUR" />
                  </Field>
                  <Field label="Credit Note Prefix">
                    <Input value={formData.creditNotePrefix} onChange={(e) => handleChange('creditNotePrefix', e.target.value.toUpperCase())} placeholder="CN" />
                  </Field>
                  <Field label="Debit Note Prefix">
                    <Input value={formData.debitNotePrefix} onChange={(e) => handleChange('debitNotePrefix', e.target.value.toUpperCase())} placeholder="DN" />
                  </Field>
                  <Field label="Starting Invoice Number">
                    <Input type="number" value={formData.invoiceStartNumber} onChange={(e) => handleChange('invoiceStartNumber', e.target.value)} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <Field label="Paper Size">
                    <Select value={formData.paperSize} onChange={(e) => handleChange('paperSize', e.target.value)}>
                      <option value="A4">Standard A4 Sheet</option>
                      <option value="A5">Compact A5 Sheet</option>
                      <option value="thermal-58">Thermal Receipt 58mm</option>
                      <option value="thermal-80">Thermal Receipt 80mm</option>
                    </Select>
                  </Field>
                  <Field label="Invoice Template">
                    <Select value={formData.template} onChange={(e) => handleChange('template', e.target.value)}>
                      <option value="modern">Modern Gradient</option>
                      <option value="classic">Classic Clean</option>
                      <option value="professional">Professional Corporate</option>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {/* Step 8: Bank & UPI */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 8: Bank Details & UPI QR Code</h2>
                    <p className="text-xs text-slate-500">Appears automatically on printed invoices for customer payments</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Account Holder Name">
                    <Input value={formData.accountName} onChange={(e) => handleChange('accountName', e.target.value)} placeholder="BalajiOne Enterprises" />
                  </Field>
                  <Field label="Bank Name">
                    <Input value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} placeholder="HDFC Bank" />
                  </Field>
                  <Field label="Account Number">
                    <Input value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} placeholder="50200012345678" />
                  </Field>
                  <Field label="IFSC Code">
                    <Input value={formData.ifsc} onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
                  </Field>
                </div>

                <Field label="UPI ID for Invoice QR">
                  <Input value={formData.upiId} onChange={(e) => handleChange('upiId', e.target.value)} placeholder="balajione@upi" />
                </Field>
              </div>
            )}

            {/* Step 9: Signature & Seal */}
            {currentStep === 9 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 9: Digital Signature & Seal</h2>
                    <p className="text-xs text-slate-500">Upload signature for automatic invoice authorization</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Signature Image URL / Path">
                    <Input value={formData.signature} onChange={(e) => handleChange('signature', e.target.value)} placeholder="/uploads/signature.png" />
                  </Field>
                  <Field label="Company Seal Image URL / Path">
                    <Input value={formData.seal} onChange={(e) => handleChange('seal', e.target.value)} placeholder="/uploads/seal.png" />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 10: Subscription */}
            {currentStep === 10 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 10: Select Subscription Plan</h2>
                    <p className="text-xs text-slate-500">Pick a plan for your business scale</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleChange('plan', plan.id)}
                      className={`cursor-pointer rounded-2xl border p-5 transition ${
                        formData.plan === plan.id
                          ? 'border-2 border-brand-600 bg-brand-50/50 shadow-md dark:bg-brand-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <div className="text-lg font-bold">{plan.name}</div>
                      <div className="text-xl font-extrabold text-brand-600 mt-1">{plan.price}</div>
                      <div className="mt-4 space-y-1 text-xs text-slate-500">
                        <div>• {plan.users}</div>
                        <div>• {plan.branches}</div>
                        <div>• {plan.storage} Storage</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 11: Branch Setup */}
            {currentStep === 11 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 11: Initial Branch Setup</h2>
                    <p className="text-xs text-slate-500">Create your primary office or store branch</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Branch Name">
                    <Input value={formData.branchName} onChange={(e) => handleChange('branchName', e.target.value)} placeholder="Head Office" />
                  </Field>
                  <Field label="Branch Code">
                    <Input value={formData.branchCode} onChange={(e) => handleChange('branchCode', e.target.value.toUpperCase())} placeholder="HO01" />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 12: Staff Setup */}
            {currentStep === 12 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 12: Staff & Team Setup</h2>
                    <p className="text-xs text-slate-500">Invite employee account (Optional)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Employee Name">
                    <Input value={formData.staffName} onChange={(e) => handleChange('staffName', e.target.value)} placeholder="Anil Kumar" />
                  </Field>
                  <Field label="Employee Email">
                    <Input type="email" value={formData.staffEmail} onChange={(e) => handleChange('staffEmail', e.target.value)} placeholder="anil@business.com" />
                  </Field>
                  <Field label="Assigned Role">
                    <Select value={formData.staffRole} onChange={(e) => handleChange('staffRole', e.target.value)}>
                      <option value="manager">Manager</option>
                      <option value="sales">Sales Executive</option>
                      <option value="accountant">Accountant</option>
                      <option value="cashier">Cashier</option>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {/* Step 13: Quick Data Seeding */}
            {currentStep === 13 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                    <PackagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Step 13: Quick Data Seeding (Optional)</h2>
                    <p className="text-xs text-slate-500">Add your first Customer, Supplier, or Product to start invoicing instantly</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-sm">Add First Customer</div>
                    <Input value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} placeholder="Customer Name" />
                    <Input value={formData.customerPhone} onChange={(e) => handleChange('customerPhone', e.target.value)} placeholder="Phone" />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-sm">Add First Supplier</div>
                    <Input value={formData.supplierName} onChange={(e) => handleChange('supplierName', e.target.value)} placeholder="Supplier Name" />
                    <Input value={formData.supplierGst} onChange={(e) => handleChange('supplierGst', e.target.value)} placeholder="GSTIN" />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-sm">Add First Product</div>
                    <Input value={formData.productName} onChange={(e) => handleChange('productName', e.target.value)} placeholder="Product Name" />
                    <Input type="number" value={formData.productPrice} onChange={(e) => handleChange('productPrice', e.target.value)} placeholder="Selling Price ₹" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 14: Complete */}
            {currentStep === 14 && (
              <div className="space-y-6 text-center py-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold">All Set! Onboarding Complete</h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                    Your company profile <strong>{formData.companyName || 'BalajiOne Invoice'}</strong> is configured and ready for invoicing.
                  </p>
                </div>

                <div className="pt-4 flex justify-center">
                  <Button
                    variant="primary"
                    loading={loading}
                    onClick={handleCompleteOnboarding}
                    className="px-10 py-4 text-base font-bold shadow-xl"
                  >
                    Go to Application Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 14 && (
              <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800/80 mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                <Button variant="primary" onClick={handleNext}>
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
