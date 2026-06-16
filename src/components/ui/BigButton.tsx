import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: '',
  secondary: 'big-button--secondary',
  success: 'big-button--success',
  danger: 'big-button--danger',
  ghost: 'big-button--ghost',
};

export function BigButton({
  variant = 'primary',
  children,
  className,
  ...rest
}: BigButtonProps) {
  return (
    <button
      className={`big-button ${variantClass[variant]} ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
