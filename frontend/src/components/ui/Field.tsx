// frontend/src/components/ui/Field.tsx
'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const CONTROL_CLASSES =
  'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-subtle ' +
  'transition placeholder:text-ink-300 hover:border-ink-300 focus:border-accent-400 disabled:bg-ink-50 disabled:text-ink-400';

const INVALID_CLASSES = 'border-red-300 focus:border-red-400';

interface FieldShellProps {
  id: string;
  label: string;
  /** Rendered next to the label, e.g. the word "optional". */
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, children, className }: FieldShellProps): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-xs font-medium text-ink-600">
        <span>{label}</span>
        {hint ? <span className="font-normal text-ink-400">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string | undefined;
  containerClassName?: string;
}

/** Labelled single-line input wired to its own error message for assistive tech. */
export function TextField({
  label,
  hint,
  error,
  containerClassName,
  className,
  ...rest
}: TextFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} {...(hint ? { hint } : {})} error={error} className={containerClassName}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_CLASSES, error && INVALID_CLASSES, className)}
        {...rest}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string | undefined;
  containerClassName?: string;
}

/** Labelled multi-line input. */
export function TextAreaField({
  label,
  hint,
  error,
  containerClassName,
  className,
  rows = 4,
  ...rest
}: TextAreaFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} {...(hint ? { hint } : {})} error={error} className={containerClassName}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_CLASSES, 'resize-y leading-6', error && INVALID_CLASSES, className)}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string | undefined;
  containerClassName?: string;
  children: ReactNode;
}

/** Labelled native select — deliberately native so mobile gets the platform picker. */
export function SelectField({
  label,
  hint,
  error,
  containerClassName,
  className,
  children,
  ...rest
}: SelectFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} {...(hint ? { hint } : {})} error={error} className={containerClassName}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_CLASSES, 'appearance-none bg-white pr-8', error && INVALID_CLASSES, className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
}

/** Checkbox with an inline label, aligned to the control rather than the text block. */
export function CheckboxField({ label, className, ...rest }: CheckboxFieldProps): JSX.Element {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className={cn('h-4 w-4 rounded border-ink-300 text-accent-600 accent-accent-600', className)}
        {...rest}
      />
      <label htmlFor={id} className="text-xs font-medium text-ink-600">
        {label}
      </label>
    </div>
  );
}

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
  hint?: string;
  error?: string | undefined;
  containerClassName?: string;
}

/** Password field with visibility toggle (eye icon) for improved usability. */
export function PasswordField({
  label,
  hint,
  error,
  containerClassName,
  className,
  ...rest
}: PasswordFieldProps): JSX.Element {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FieldShell id={id} label={label} {...(hint ? { hint } : {})} error={error} className={containerClassName}>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full rounded-xl border border-ink-200 bg-white pl-3 pr-10 py-2 text-sm text-ink-900 shadow-subtle',
            'transition placeholder:text-ink-300 hover:border-ink-300 focus:border-accent-400 disabled:bg-ink-50 disabled:text-ink-400',
            error && INVALID_CLASSES,
            className
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-ink-500 hover:text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-1 rounded p-1 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff aria-hidden className="h-4 w-4" />
          ) : (
            <Eye aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
    </FieldShell>
  );
}
