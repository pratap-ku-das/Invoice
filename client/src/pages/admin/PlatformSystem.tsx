import { useState } from 'react';
import { Mail, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Field } from '@/components/ui/primitives';

export default function PlatformSystem() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smtpServer, setSmtpServer] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Global System Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure SaaS platform maintenance mode, email SMTP servers, API keys, and global feature toggles.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Maintenance Mode Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Platform Maintenance Mode
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                When active, normal tenant users see a maintenance window while platform admins retain full access.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-6 w-6 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Global SMTP Setup */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="font-bold text-base flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-600" />
            Global Email SMTP Gateway
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SMTP Host Server">
              <Input value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} />
            </Field>
            <Field label="SMTP Port">
              <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" type="submit">
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
}
