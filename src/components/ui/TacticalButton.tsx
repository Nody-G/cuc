import React from 'react';

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  chamfer?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  chamfer = true,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-display tracking-wider uppercase font-bold transition-all duration-150 focus:outline-none cursor-pointer select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-sm px-4 py-2 gap-2 tracking-wide',
    md: 'text-base px-6 py-3 gap-2.5 tracking-wider',
    lg: 'text-lg px-8 py-4 gap-3 tracking-widest',
  };

  const variantStyles = {
    primary:
      'bg-[#FFE500] text-black hover:bg-[#FFF04D] hover:shadow-[0_0_20px_rgba(255,229,0,0.4)] border border-[#FFE500]',
    secondary:
      'bg-[#18181F] text-white hover:bg-[#22222B] hover:text-[#FFE500] border border-[#2B2B38] hover:border-[#FFE500]/40',
    outline:
      'bg-transparent text-[#FFE500] border-2 border-[#FFE500] hover:bg-[#FFE500] hover:text-black hover:shadow-[0_0_15px_rgba(255,229,0,0.3)]',
    danger:
      'bg-[#E53E3E] text-white hover:bg-[#FF4D4D] hover:shadow-[0_0_20px_rgba(229,62,62,0.4)] border border-[#E53E3E]',
  };

  const chamferClass = chamfer ? 'clip-chamfer' : 'rounded-xs';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${chamferClass} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
