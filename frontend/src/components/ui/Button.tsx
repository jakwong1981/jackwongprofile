// frontend/src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Visual weight of a button. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Control height. */
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a spinner and disables interaction. */
  loading?: boolean;
  /** Optional leading icon, typically a `lucide-react` element. */
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-300',
  secondary: 'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50 disabled:text-ink-400',
  ghost: 'text-ink-600 hover:bg-ink-100/80 hover:text-ink-900 disabled:text-ink-300',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 disabled:text-red-300',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8rem]',
  md: 'h-10 gap-2 px-4 text-sm',
};

/**
 * The single button primitive used across the public site and the admin portal.
 *
 * @param props standard button attributes plus {@link ButtonProps}
 * @returns the rendered control
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition duration-150',
        'disabled:cursor-not-allowed disabled:opacity-70',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner(): JSX.Element {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
