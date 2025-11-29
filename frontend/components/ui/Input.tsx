import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all shadow-sm ${
          error ? 'border-destructive ring-destructive/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive ml-1">{error}</p>}
    </div>
  );
};