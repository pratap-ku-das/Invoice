import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | undefined | null, currency = '₹') {
  const n = typeof value === 'number' && isFinite(value) ? value : 0;
  return `${currency}${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number | undefined | null) {
  const n = typeof value === 'number' && isFinite(value) ? value : 0;
  return n.toLocaleString('en-IN');
}

export function formatDate(value?: string | Date | null, fmt = 'DD MMM YYYY') {
  if (!value) return '—';
  return dayjs(value).format(fmt);
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 300) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
