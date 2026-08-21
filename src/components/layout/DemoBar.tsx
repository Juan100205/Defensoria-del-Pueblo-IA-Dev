import { useState } from 'react';
import { Icon } from '../../icons/Icons';
import type { Scene } from '../../data/constants';

interface DemoBarProps {
  currentScene: Scene;
  onNavigate: (scene: Scene) => void;
}

const scenes: { key: Scene; label: string; icon: string }[] = [
  { key: 'portal', label: 'Portal', icon: 'grid' },
  { key: 'chat', label: 'Chatbot', icon: 'chat' },
  { key: 'conf', label: 'Radicado', icon: 'check' },
  { key: 'mail', label: 'Correo', icon: 'mail' },
  { key: 'proc', label: 'Analisis', icon: 'doc' },
  { key: 'admin', label: 'Panel', icon: 'gear' },
];

export function DemoBar({ currentScene, onNavigate }: DemoBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="demo-fab" aria-label="Navegacion del prototipo">
      {open && (
        <div className="demo-menu">
          {scenes.map((s) => (
            <button
              key={s.key}
              className={`demo-item ${currentScene === s.key ? 'act' : ''}`}
              onClick={() => { onNavigate(s.key); setOpen(false); }}
            >
              <Icon name={s.icon as any} size={15} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        className={`demo-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu de navegacion"
      >
        <Icon name={open ? 'x' : 'grid'} size={20} />
      </button>
    </nav>
  );
}
