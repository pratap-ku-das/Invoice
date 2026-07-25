import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, Building2 } from 'lucide-react';
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
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-slate-50 bg-mesh-light p-4 dark:bg-slate-950 dark:bg-mesh-dark">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8 shadow-soft"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-500">Sign in to your billing workspace</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="you@business.com" {...register('email')} />
          </Field>
          <Field label="Password" error={errors.password?.message} required>
            <Input type="password" placeholder="••••••••" {...register('password')} />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Multi-Company Management Dashboard Direct Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/admin/companies')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 py-2.5 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-brand-300"
          >
            <Building2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Multi-Company Management Dashboard
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create your company account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
