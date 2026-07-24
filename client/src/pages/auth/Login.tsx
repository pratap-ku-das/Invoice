import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
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
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your billing workspace</p>
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

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create your company account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
