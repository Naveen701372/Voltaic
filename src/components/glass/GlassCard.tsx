import { forwardRef } from 'react';

import { GlassCardProps } from './types';
import { cn, getGlassStyles } from './utils';

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    (
        {
            children,
            title,
            subtitle,
            action,
            className,
            padding = 'md',
            hover = false,
            variant = 'light',
            blur = 'md',
            border = true,
            shadow = true,
            animated = false,
            ...props
        },
        ref
    ) => {
        const paddingStyles = {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        }[padding];

        const cardStyles = cn(
            getGlassStyles({
                variant,
                blur,
                border,
                shadow,
                animated: animated || hover,
            }),
            'rounded-2xl',
            paddingStyles,
            hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '',
            className
        );

        return (
            <div ref={ref} className={cardStyles} {...props}>
                {(title || subtitle || action) && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                            {title && (
                                <h3 className="text-lg font-semibold text-foreground/90">
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="text-sm text-foreground/60">{subtitle}</p>
                            )}
                        </div>
                        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
                    </div>
                )}
                <div className="text-foreground/80">{children}</div>
            </div>
        );
    }
);

GlassCard.displayName = 'GlassCard'; 