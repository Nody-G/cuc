import React from 'react';

interface StuntBadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'dark' | 'outline' | 'red' | 'green';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const StuntBadge: React.FC<StuntBadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'sm',
  icon,
  className = '',
}) => {
  const base =
    'inline-flex items-center font-mono-tech tracking-wider uppercase font-semibold border select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
  };

  const variantStyles = {
    yellow: 'bg-[#FFE500]/10 text-[#FFE500] border-[#FFE500]/30',
    dark: 'bg-[#18181F] text-zinc-300 border-zinc-800',
    outline: 'bg-transparent text-zinc-200 border-zinc-700',
    red: 'bg-red-950/40 text-red-400 border-red-800/50',
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50',
  };

  return (
    <span className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
