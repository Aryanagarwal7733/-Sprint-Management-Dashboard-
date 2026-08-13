import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all cursor-pointer appearance-none',
              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
              'focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
              'disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 disabled:pointer-events-none',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500'
            ),
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.25rem',
            backgroundRepeat: 'no-repeat',
            paddingRight: '2.5rem'
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs font-medium text-rose-500 animate-slide-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
