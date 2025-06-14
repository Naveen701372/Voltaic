import { ReactNode } from 'react';

export interface GlassProps {
    children: ReactNode;
    className?: string;
    variant?: 'light' | 'dark' | 'primary';
    blur?: 'sm' | 'md' | 'lg' | 'xl';
    opacity?: 'low' | 'medium' | 'high';
    border?: boolean;
    shadow?: boolean;
    animated?: boolean;
}

export interface GlassButtonProps extends Omit<GlassProps, 'children'> {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
}

export interface GlassInputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'textarea';
    disabled?: boolean;
    error?: string;
    label?: string;
    className?: string;
}

export interface GlassCardProps extends GlassProps {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    padding?: 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
} 