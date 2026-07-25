import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, Building2, ShieldCheck, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input, Field } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';
import { apiError } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success('Logged in successfully!');
      if (user?.role === 'super_admin' || user?.role === 'platform_owner') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Dynamic Ambient Atmospheric Glow Background */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Realistic Artwork & Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 flex flex-col justify-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-300 backdrop-blur-md w-fit">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>PaperBolt Enterprise SaaS Suite v2.0</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Next-Gen Multi-Tenant <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Billing & ERP Platform
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            Manage GST tax invoices, quotations, stock transfers, multiple company branches, and recurring SaaS billing from one unified control center.
          </p>

          {/* 3D Realistic Showcase Container */}
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl shadow-2xl">
            <img
              src="/login_3d_hero.png"
              alt="3D Enterprise Billing Showcase"
              className="w-full h-64 md:h-80 object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
            />

            {/* Floating Glass Metrics Badges */}
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-slate-950/80 p-3.5 backdrop-blur-md shadow-xl flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg">
                ₹
              </div>
              <div>
                <div className="text-xs font-bold text-white">₹2,45,000 Volume</div>
                <div className="text-[10px] text-slate-400">Processed this month</div>
              </div>
            </div>

            <div className="absolute top-6 right-6 rounded-2xl border border-white/20 bg-slate-950/80 p-3.5 backdrop-blur-md shadow-xl flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">99.98% SLA Uptime</div>
                <div className="text-[10px] text-emerald-400">MongoDB Replica Active</div>
              </div>
            </div>
          </div>

          {/* Feature Micro-Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-300 pt-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Rule 46 GST Ready</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3">
              <CheckCircle className="h-4 w-4 text-brand-400 shrink-0" />
              <span>Multi-Company Tenant</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3">
              <CheckCircle className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Puppeteer Chrome PDF</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Glassmorphic Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-glow">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Sign In</h2>
                  <p className="text-xs text-slate-400">Access your workspace or admin panel</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Work Email" error={errors.email?.message} required>
                <Input
                  type="email"
                  placeholder="you@business.com"
                  {...register('email')}
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-brand-500"
                />
              </Field>

              <Field label="Password" error={errors.password?.message} required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-brand-500"
                />
              </Field>

              <Button type="submit" loading={loading} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 text-sm shadow-glow">
                Sign In to Platform
              </Button>
            </form>

            {/* Quick 1-Click Super Admin Auto-Fill */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@paperbolt.com');
                  setValue('password', 'Admin@123');
                }}
                className="w-full rounded-xl border border-brand-500/30 bg-brand-500/10 py-2.5 px-3 text-xs font-bold text-brand-300 hover:bg-brand-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-brand-400" />
                Fill Super Admin Login (admin@paperbolt.com)
              </button>
            </div>

            {/* Multi-Company Management Direct Control Button */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/admin/companies')}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 px-3 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition"
              >
                <Building2 className="h-4 w-4 text-purple-400" />
                Multi-Company Admin Dashboard
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </button>

              <p className="text-center text-xs text-slate-400">
                New business owner?{' '}
                <Link to="/register" className="font-bold text-brand-400 hover:underline">
                  Register new company
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
