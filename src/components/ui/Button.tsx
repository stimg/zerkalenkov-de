import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-secondary-400 via-secondary-250 to-secondary-400 text-white hover:from-secondary-300 hover:via-secondary-200 hover:to-secondary-300 shadow-sm border border-secondary-200':
              variant === 'primary',
            'bg-gray-300 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700':
              variant === 'secondary',
            'border-2 border-secondary-400 text-secondary-500 dark:border-secondary-250 dark:text-secondary-250 hover:bg-secondary-50 dark:hover:bg-secondary-800':
              variant === 'outline',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800':
              variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-7 py-3.5 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
