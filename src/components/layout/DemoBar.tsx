import type { Scene } from '../../data/constants';

interface DemoBarProps {
  currentScene: Scene;
  onNavigate: (scene: Scene) => void;
}

const scenes: { key: Scene; label: string }[] = [
  { key: 'portal', label: 'Portal' },
  { key: 'chat', label: 'Chatbot' },
  { key: 'conf', label: 'Radicado' },
  { key: 'mail', label: 'Correo' },
  { key: 'proc', label: 'Análisis' },
  { key: 'admin', label: 'Panel' },
];

export function DemoBar({ currentScene, onNavigate }: DemoBarProps) {
  return (
    <nav className="demobar" aria-label="Navegación del prototipo">
      <span className="lb">Recorrido</span>
      {scenes.map((s) => (
        <button
          key={s.key}
          className={currentScene === s.key ? 'act' : ''}
          onClick={() => onNavigate(s.key)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
