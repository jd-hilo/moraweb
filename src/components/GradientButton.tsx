import { ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'turquoise' | 'purple' | 'peach' | 'career';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  children,
  variant = 'turquoise',
  size = 'lg',
  className = '',
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const gradientClass = `gradient-${variant}`;

  return (
    <button
      className={`${gradientClass} ${sizeClasses[size]} text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
