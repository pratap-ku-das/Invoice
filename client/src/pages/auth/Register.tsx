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
  name: z.string().min(2, 'Your name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: signup } = useAuth();
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
      await signup(data);
      toast.success('Account created! Let us set up your company.');
      navigate('/onboarding');
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
            <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-500">Start invoicing in minutes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Your Name" error={errors.name?.message} required>
            <Input placeholder="Priya Sharma" {...register('name')} />
          </Field>
          <Field label="Company Name" error={errors.companyName?.message} required>
            <Input placeholder="Sharma Traders" {...register('companyName')} />
          </Field>
          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="you@business.com" {...register('email')} />
          </Field>
          <Field label="Password" error={errors.password?.message} required>
            <Input type="password" placeholder="Minimum 8 characters" {...register('password')} />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
