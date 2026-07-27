import React from 'react';

const paths: Record<string, React.ReactNode> = {
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.7A8.4 8.4 0 0 1 3.6 11 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></>,
  check: <><path d="M20 6 9 17l-5-5"/></>,
  checkc: <><circle cx="12" cy="12" r="9"/><path d="M8.5 12.2 11 14.7l4.6-5"/></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></>,
  down: <><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></>,
  bell: <><path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/></>,
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></>,
  eye: <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.7"/></>,
  users: <><path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20"/><circle cx="9.5" cy="8" r="3.4"/><path d="M21 20v-1.6a3.4 3.4 0 0 0-2.6-3.3M15.5 4.7a3.4 3.4 0 0 1 0 6.6"/></>,
  alert: <><path d="M10.3 3.9 2.4 17.1A1.9 1.9 0 0 0 4 20h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17h.01"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  export: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7.5 9.5 12 5l4.5 4.5M12 5v11"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></>,
  spark: <><path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9z"/><path d="M18.5 3v3M20 4.5h-3M5.5 17v2.4M6.7 18.2H4.3"/></>,
  shield: <><path d="M12 21s7-3.2 7-9V5.9L12 3 5 5.9V12c0 5.8 7 9 7 9z"/><path d="m9.2 12 2 2 3.6-3.8"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
  clip: <><path d="M20.4 11.5 12 19.9a5 5 0 0 1-7.1-7.1l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></>,
  lock: <><rect x="4" y="10.5" width="16" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></>,
  pin: <><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10.3" r="2.8"/></>,
  x: <><path d="m6 6 12 12M18 6 6 18"/></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4.8A2 2 0 0 1 4.8 2.8H12a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/></>,
  scale: <><path d="M12 3v18M7 21h10M5 7h14M8.5 7 5.5 14h6zM15.5 7l-3 7h6z"/></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4.5M9 14h.01M15 14h.01M9.5 17.2h5"/><path d="M2.5 13v2.5M21.5 13v2.5"/></>,
  flow: <><rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v5.5a2 2 0 0 0 2 2H14"/></>,
  fire: <><path d="M12 21c3.9 0 6.5-2.6 6.5-6 0-4.5-4-5.5-4-9.5-2.5 1-3.6 3.4-3.6 5.4 0 1-.7 1.6-1.4 1.6-.8 0-1.5-.7-1.5-2C6.4 11.5 5.5 13 5.5 15c0 3.4 2.6 6 6.5 6z"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  filter: <><path d="M3 5h18l-7 8.2V20l-4 1.5v-8.3z"/></>,
};

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 16, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Emblem({ size = 52 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.64)}
      viewBox="0 0 200 128"
      style={{ color: 'var(--navy)' }}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <circle cx="100" cy="30" r="23" />
        <use
          href="#co-shape"
          transform="translate(90.2,17.4) scale(0.0615)"
          fill="#fff"
        />
        <g>
          <g stroke="#fff" strokeWidth="2.6">
            <use href="#dp-feather" transform="rotate(-27,116,78)" />
            <use href="#dp-feather" transform="rotate(-14,116,78)" />
            <use href="#dp-feather" />
            <use href="#dp-feather" transform="rotate(13,116,78)" />
          </g>
          <use href="#dp-body" />
          <path d="M105,72 L98.5,70.5 L104,80 Z" />
          <circle cx="112" cy="79" r="2" fill="#fff" />
        </g>
        <g transform="translate(200,0) scale(-1,1)">
          <g stroke="#fff" strokeWidth="2.6">
            <use href="#dp-feather" transform="rotate(-27,116,78)" />
            <use href="#dp-feather" transform="rotate(-14,116,78)" />
            <use href="#dp-feather" />
            <use href="#dp-feather" transform="rotate(13,116,78)" />
          </g>
          <use href="#dp-body" />
          <path d="M105,72 L98.5,70.5 L104,80 Z" />
          <circle cx="112" cy="79" r="2" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <path
          id="co-shape"
          d="M232,18 L240,44 L206,58 L152,60 L122,74 L94,66 L70,60 L58,80 L76,98 L60,124 L48,162 L54,202 L72,242 L84,272 L102,302 L122,298 L152,332 L182,354 L196,394 L210,380 L234,340 L252,300 L264,268 L250,240 L270,214 L300,190 L286,150 L262,130 L250,100 L256,68 Z"
        />
        <path
          id="dp-feather"
          d="M116,78 C122,54 136,32 158,18 C152,44 140,68 126,88 Z"
        />
        <path
          id="dp-body"
          d="M105,71 C114,64 129,67 133,79 C139,97 130,117 114,119 C104,120 98,111 100,99 C101,89 99,78 105,71 Z"
        />
      </defs>
    </svg>
  );
}
