import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: boolean;
  header?: React.ReactNode;
  className?: string;
}

export function Card({ children, padding, header, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {header && <div className="card-hd">{header}</div>}
      <div className={padding ? 'card-p' : ''}>{children}</div>
    </div>
  );
}
