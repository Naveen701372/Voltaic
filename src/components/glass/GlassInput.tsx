import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn, getGlassInputStyles } from './utils';

interface GlassInputHTMLProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    label?: string;
}

interface GlassTextareaHTMLProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    label?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputHTMLProps>(
    (
        {
            value,
            onChange,
            placeholder,
            type = 'text',
            disabled = false,
            error,
            label,
            className,
            ...props
        },
        ref
    ) => {
        const inputStyles = cn(
            getGlassInputStyles({ error: !!error }),
            'rounded-xl',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className
        );

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange(e.target.value);
            }
        };

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-foreground/70">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={inputStyles}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500/80 mt-1">{error}</p>
                )}
            </div>
        );
    }
);

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaHTMLProps>(
    (
        {
            value,
            onChange,
            placeholder,
            disabled = false,
            error,
            label,
            className,
            rows = 4,
            ...props
        },
        ref
    ) => {
        const textareaStyles = cn(
            getGlassInputStyles({ error: !!error }),
            'rounded-xl resize-none',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className
        );

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (onChange) {
                onChange(e.target.value);
            }
        };

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-foreground/70">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    className={textareaStyles}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500/80 mt-1">{error}</p>
                )}
            </div>
        );
    }
);

GlassInput.displayName = 'GlassInput';
GlassTextarea.displayName = 'GlassTextarea'; 