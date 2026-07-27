import React from 'react';

type BadgeVariant = 'navy' | 'gold' | 'red' | 'green' | 'grey';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const variantClass: Record<BadgeVariant, string> = {
  navy: 'b-navy',
  gold: 'b-gold',
  red: 'b-red',
  green: 'b-green',
  grey: 'b-grey',
};

export function Badge({ variant, children, dot, className = '', style }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`} style={style}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
