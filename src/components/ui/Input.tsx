import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputWrapperProps {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function InputWrapper({ label, error, children }: InputWrapperProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-stone-700)',
          marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <span style={{
          display: 'block',
          fontSize: '0.8125rem',
          color: 'var(--color-warning)',
          marginTop: '4px',
        }}>
          {error}
        </span>
      )}
    </div>
  );
}

const inputBaseStyles: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.9375rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-stone-800)',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--color-stone-200)',
  borderRadius: 'var(--radius-md)',
  transition: 'all var(--transition-fast)',
  outline: 'none',
};

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...props }, ref) {
    return (
      <input
        ref={ref}
        style={{ ...inputBaseStyles, ...style }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-500)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-stone-200)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ style, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        style={{
          ...inputBaseStyles,
          resize: 'vertical',
          minHeight: '100px',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-500)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-stone-200)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ style, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        style={{
          ...inputBaseStyles,
          cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '40px',
          appearance: 'none',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-500)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-100)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-stone-200)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
