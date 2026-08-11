import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverGlow = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#121824]/80 backdrop-blur-xl border border-gray-800/80 rounded-xl overflow-hidden transition-all duration-300',
        hoverGlow && 'hover:border-blue-500/40 hover:shadow-glow-blue/20 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
