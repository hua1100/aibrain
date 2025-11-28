import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold nb-border nb-shadow-hover nb-text uppercase tracking-wide';

  const variantStyles = {
    primary: 'bg-[var(--nb-yellow)] text-[var(--nb-black)] hover:bg-[var(--nb-lime)]',
    secondary: 'bg-[var(--nb-coral)] text-[var(--nb-white)] hover:bg-[var(--nb-pink)]',
    outline: 'bg-[var(--nb-white)] text-[var(--nb-black)] hover:bg-[var(--nb-bg)]',
    ghost: 'bg-transparent text-[var(--nb-black)] border-none shadow-none hover:bg-[var(--nb-bg)]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || isLoading ? disabledStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          載入中...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
