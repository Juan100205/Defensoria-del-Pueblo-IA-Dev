import React from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Field({ label, className = '', ...props }: FieldProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && <label className="lbl">{label}</label>}
      <input className={`field ${className}`} {...props} />
    </div>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextareaField({ label, className = '', ...props }: TextareaFieldProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && <label className="lbl">{label}</label>}
      <textarea className={`field ${className}`} {...props} />
    </div>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
}

export function SelectField({ label, options, className = '', ...props }: SelectFieldProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && <label className="lbl">{label}</label>}
      <select className={`sel ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
