import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, type LucideIcon } from 'lucide-react';

/** Rounded tinted container giving icons a consistent premium treatment. */
export function IconChip({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span className={cn('icon-chip', className)}>
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className, children, disabled, ...props }, ref) => {
    const styles = {
      primary: 'btn-primary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn bg-red-600 text-white hover:bg-red-700',
    }[variant];
    return (
      <button
        ref={ref}
        className={cn(styles, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('input', error && 'border-red-500 focus:ring-red-500/20', className)}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn('input', error && 'border-red-500', className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('input min-h-[80px]', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export function Field({
  label,
  error,
  required,
  children,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  blue: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
};

export function Badge({
  tone = 'gray',
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}
