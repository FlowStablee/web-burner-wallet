import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    hover?: boolean;
}

export default function Card({ children, className = '', glow = false, hover = false }: CardProps) {
    const classes = [
        'card',
        glow ? 'card-glow' : '',
        hover ? 'card-hover' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card-footer ${className}`}>{children}</div>;
}
