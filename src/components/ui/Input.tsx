import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all',
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
                'focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
                'placeholder:text-slate-400 dark:placeholder:text-slate-600',
                'disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 disabled:pointer-events-none',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500'
              ),
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-medium text-rose-500 animate-slide-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
