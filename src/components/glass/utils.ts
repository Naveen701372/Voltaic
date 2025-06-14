import { twMerge } from 'tailwind-merge';

import { GlassProps } from './types';

// Custom clsx implementation to avoid webpack issues
function clsx(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
    const classes: string[] = [];

    for (const input of inputs) {
        if (!input) continue;

        if (typeof input === 'string') {
            classes.push(input);
        } else if (typeof input === 'object') {
            for (const [key, value] of Object.entries(input)) {
                if (value) classes.push(key);
            }
        }
    }

    return classes.join(' ');
}

export function cn(...inputs: (string | undefined)[]): string {
    return twMerge(clsx(...inputs));
}

export function getGlassStyles({
    variant = 'light',
    blur = 'md',
    border = true,
    shadow = true,
    animated = false,
}: Partial<GlassProps> = {}): string {
    const baseStyles = 'relative overflow-hidden';

    // Background based on variant
    const backgroundStyles = {
        light: 'bg-glass-100',
        dark: 'bg-dark-200',
        primary: 'bg-primary-500/10',
    }[variant];

    // Backdrop blur
    const blurStyles = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    }[blur];

    // Border styles
    const borderStyles = border
        ? variant === 'light'
            ? 'border border-glass-200'
            : 'border border-dark-100'
        : '';

    // Shadow styles
    const shadowStyles = shadow
        ? 'shadow-lg shadow-black/5'
        : '';

    // Animation styles
    const animationStyles = animated
        ? 'transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl'
        : 'transition-all duration-200';

    return cn(
        baseStyles,
        backgroundStyles,
        blurStyles,
        borderStyles,
        shadowStyles,
        animationStyles
    );
}

export function getGlassButtonStyles({
    size = 'md',
    disabled = false,
    loading = false,
    variant = 'light',
}: {
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    variant?: 'light' | 'dark' | 'primary';
} = {}): string {
    const baseStyles = getGlassStyles({ variant, animated: true });

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 text-base rounded-xl',
        lg: 'px-6 py-3 text-lg rounded-2xl',
    }[size];

    const stateStyles = cn(
        'font-medium cursor-pointer select-none',
        'hover:bg-opacity-20 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : '',
        loading ? 'cursor-wait' : ''
    );

    return cn(baseStyles, sizeStyles, stateStyles);
}

export function getGlassInputStyles({
    error = false,
}: { error?: boolean } = {}): string {
    const baseStyles = getGlassStyles({
        variant: 'dark',
        blur: 'md'
    });

    const inputStyles = cn(
        'w-full px-4 py-2 text-white placeholder-white/40',
        'bg-white/5 backdrop-blur-md border border-white/20',
        'focus:bg-white/10 focus:border-primary-400/50 focus:placeholder-white/60',
        'hover:bg-white/8 hover:border-white/30',
        'transition-all duration-300',
        error ? 'border-red-400/50 focus:border-red-400/70' : ''
    );

    return cn(baseStyles, inputStyles);
} 