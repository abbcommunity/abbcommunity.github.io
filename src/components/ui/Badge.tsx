import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'crimson' | 'outline' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full backdrop-blur-md border tracking-wider uppercase';

  const variants = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
    crimson: 'bg-red-900/30 text-red-400 border-red-500/30',
    gray: 'bg-gray-800/60 text-gray-300 border-gray-700',
    outline: 'bg-transparent text-gray-300 border-gray-600',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
