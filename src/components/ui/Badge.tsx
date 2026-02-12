import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          {
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': variant === 'default',
            'bg-green-100 text-teal-700 dark:bg-teal-800/30 dark:text-teal-400': variant === 'success',
            'bg-blue-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400': variant === 'info',
            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': variant === 'warning',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
