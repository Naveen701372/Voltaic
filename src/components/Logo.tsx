import { Zap } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
    variant?: 'icon' | 'full' | 'svg';
}

export function Logo({
    size = 32,
    className = '',
    showText = false,
    variant = 'icon'
}: LogoProps) {
    const [imageError, setImageError] = useState(false);

    // If we want to use the SVG logo
    if (variant === 'svg' && !imageError) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Image
                    src="/favicon.svg"
                    alt="Voltaic Logo"
                    width={size}
                    height={size}
                    onError={() => setImageError(true)}
                    className="flex-shrink-0"
                />
                {showText && (
                    <span className="text-xl font-bold text-white">Voltaic</span>
                )}
            </div>
        );
    }

    // Fallback to Lucide Zap icon (current implementation)
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Zap className={`w-${Math.floor(size / 4)} h-${Math.floor(size / 4)} flex-shrink-0`} style={{ width: size, height: size }} />
            {showText && (
                <span className="text-xl font-bold text-white">Voltaic</span>
            )}
        </div>
    );
}

// Convenience components for common use cases
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
    return <Logo size={size} className={className} variant="icon" />;
}

export function LogoWithText({ size = 32, className = '' }: { size?: number; className?: string }) {
    return <Logo size={size} className={className} showText variant="icon" />;
}

export function LogoSVG({ size = 32, className = '' }: { size?: number; className?: string }) {
    return <Logo size={size} className={className} variant="svg" />;
} 