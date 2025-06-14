import { forwardRef, ButtonHTMLAttributes } from 'react';

import { GlassButtonProps } from './types';
import { cn, getGlassButtonStyles } from './utils';

interface GlassButtonHTMLProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof GlassButtonProps>,
    GlassButtonProps { }

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonHTMLProps>(
    (
        {
            children,
            className,
            size = 'md',
            variant = 'light',
            disabled = false,
            loading = false,
            type = 'button',
            onClick,
            ...props
        },
        ref
    ) => {
        const buttonStyles = cn(
            getGlassButtonStyles({ size, disabled, loading, variant }),
            'relative inline-flex items-center justify-center gap-2',
            'text-foreground/90 font-medium',
            className
        );

        const handleClick = () => {
            if (!disabled && !loading && onClick) {
                onClick();
            }
        };

        return (
            <button
                ref={ref}
                type={type}
                className={buttonStyles}
                disabled={disabled || loading}
                onClick={handleClick}
                aria-disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <span className={loading ? 'opacity-0' : 'opacity-100'}>
                    {children}
                </span>
            </button>
        );
    }
);

GlassButton.displayName = 'GlassButton'; 