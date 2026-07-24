import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import { Button, Input, Field } from '@/components/ui/primitives';

export default function PlatformProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Platform Owner');
  const [email] = useState(user?.email || 'admin@platform.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Admin profile updated successfully');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Platform Admin Profile & Security
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your Platform Owner administrator account details, credentials, and access keys.
        </p>
      </div>

      {/* Account Info Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="font-bold text-base flex items-center gap-2">
            <User className="h-5 w-5 text-brand-600" />
            Administrator Credentials
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Admin Email">
              <Input value={email} disabled className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed" />
            </Field>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="font-bold text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-600" />
            Change Security Password
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Current Password">
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="New Password">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" type="submit">
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  );
}
