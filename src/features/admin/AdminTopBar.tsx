import { Icon } from '../../icons/Icons';
import type { AdminView } from '../../data/constants';
import type { Scene } from '../../data/constants';

interface AdminTopBarProps {
  currentView: AdminView;
  onNavigateScene: (scene: Scene) => void;
}

const VIEWS: Record<AdminView, [string, string]> = {
  dash: ['Operación', 'Dashboard'],
  sol: ['Operación', 'Solicitudes'],
  det: ['Operación', 'Visualizador de solicitud'],
  alert: ['Operación', 'Alertas'],
  ana: ['Análisis', 'Analítica'],
  exp: ['Análisis', 'Exportaciones'],
  usr: ['Administración', 'Gestión de usuarios'],
  cfg: ['Administración', 'Configuración'],
};

export function AdminTopBar({ currentView, onNavigateScene }: AdminTopBarProps) {
  const [crumb, title] = VIEWS[currentView];

  return (
    <header className="top">
      <div>
        <div className="crumb">{crumb}</div>
        <h2>{title}</h2>
      </div>
      <div className="row gap12">
        <div className="search">
          <Icon name="search" size={16} style={{ color: 'var(--ink-3)' }} />
          <input className="field" placeholder="Buscar radicado, cédula o palabra clave" aria-label="Buscar" />
        </div>
        <button className="icon-btn" title="Alertas">
          <Icon name="bell" size={19} />
          <span className="pip" />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigateScene('portal')}>
          Vista ciudadano
        </button>
      </div>
    </header>
  );
}
