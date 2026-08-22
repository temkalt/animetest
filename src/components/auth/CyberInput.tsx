'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  isPassword?: boolean;
}

export const CyberInput: React.FC<CyberInputProps> = ({
  label,
  icon: Icon,
  error,
  isPassword = false,
  value,
  id,
  type = 'text',
  className = '',
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloated = isFocused || hasValue;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full space-y-1 group">
      <div
        className={`relative flex items-center rounded-lg border transition-all duration-200 ${
          error
            ? 'border-zinc-800 bg-zinc-800'
            : isFocused
            ? 'border-zinc-700 bg-zinc-900'
            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
        } ${className}`}
      >
        {/* Leading Icon */}
        {Icon && (
          <div className="pl-3.5 pr-1 flex items-center pointer-events-none">
            <Icon
              className={`w-4 h-4 transition-colors duration-200 ${
                error
                  ? 'text-zinc-400'
                  : isFocused
                  ? 'text-zinc-100'
                  : 'text-zinc-500 group-hover:text-zinc-400'
              }`}
            />
          </div>
        )}

        {/* Input Field */}
        <div className="relative flex-1 py-3 px-3">
          <input
            {...props}
            id={inputId}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className="w-full bg-transparent text-zinc-100 text-xs sm:text-sm font-sans placeholder-transparent focus:outline-none disabled:opacity-50 pt-2.5 pb-0.5"
            placeholder={label}
          />

          {/* Floating Label */}
          <label
            htmlFor={inputId}
            className={`absolute left-3 transition-all duration-150 pointer-events-none select-none font-mono ${
              isFloated
                ? '-top-0.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400'
                : 'top-3.5 text-xs sm:text-sm text-zinc-500'
            } ${error ? 'text-zinc-400' : isFocused ? 'text-zinc-200' : ''}`}
          >
            {label}
          </label>
        </div>

        {/* Password Reveal Button */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3.5 pl-1.5 py-2 text-zinc-500 hover:text-zinc-100 focus:outline-none transition-colors"
            title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-zinc-300" />
            ) : (
              <Eye className="w-4 h-4 text-zinc-500" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] font-mono text-zinc-400 pl-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-lg bg-zinc-800 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
};
