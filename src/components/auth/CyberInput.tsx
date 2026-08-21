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

  const inputId = id || `cyber-input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloated = isFocused || hasValue;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full space-y-1 group">
      <div
        className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
          error
            ? 'border-rose-500/60 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            : isFocused
            ? 'border-cyan-400/60 bg-[#0B0F1E]/90 shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_0_12px_rgba(6,182,212,0.06)]'
            : 'border-white/10 bg-[#070913]/70 hover:border-white/20'
        } backdrop-blur-xl ${className}`}
      >
        {/* Leading Icon */}
        {Icon && (
          <div className="pl-3.5 pr-1 flex items-center pointer-events-none">
            <Icon
              className={`w-4 h-4 transition-colors duration-300 ${
                error
                  ? 'text-rose-400'
                  : isFocused
                  ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'text-slate-400 group-hover:text-slate-300'
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
            className="w-full bg-transparent text-white text-xs sm:text-sm font-sans placeholder-transparent focus:outline-none disabled:opacity-50 pt-2.5 pb-0.5"
            placeholder={label}
          />

          {/* Floating Label */}
          <label
            htmlFor={inputId}
            className={`absolute left-3 transition-all duration-200 pointer-events-none select-none font-mono ${
              isFloated
                ? '-top-0.5 text-[10px] uppercase tracking-wider font-semibold'
                : 'top-3.5 text-xs sm:text-sm'
            } ${
              error
                ? 'text-rose-400'
                : isFocused
                ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                : isFloated
                ? 'text-slate-400'
                : 'text-slate-400'
            }`}
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
            className="pr-3.5 pl-1.5 py-2 text-slate-400 hover:text-cyan-300 focus:outline-none transition-colors"
            title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-cyan-400 transition-transform active:scale-90" />
            ) : (
              <Eye className="w-4 h-4 transition-transform active:scale-90" />
            )}
          </button>
        )}

        {/* Cyberpunk Specular Edge Highlight on Focus */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-cyan-400/40" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] font-mono text-rose-400 pl-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-400 inline-block animate-pulse" />
          {error}
        </p>
      )}
    </div>
  );
};
