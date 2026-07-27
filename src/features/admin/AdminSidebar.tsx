import { Emblem, Icon } from '../../icons/Icons';
import type { AdminView } from '../../data/constants';

interface AdminSidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
}

const navGroups = [
  {
    label: 'Operación',
    items: [
      { key: 'dash' as const, icon: 'grid' as const, label: 'Dashboard', count: undefined },
      { key: 'sol' as const, icon: 'list' as const, label: 'Solicitudes', count: 248 },
      { key: 'det' as const, icon: 'eye' as const, label: 'Visualizador', count: undefined },
      { key: 'alert' as const, icon: 'alert' as const, label: 'Alertas', count: 9, hot: true },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { key: 'ana' as const, icon: 'chart' as const, label: 'Analítica', count: undefined },
      { key: 'exp' as const, icon: 'export' as const, label: 'Exportaciones', count: undefined },
    ],
  },
  {
    label: 'Administración',
    items: [
      { key: 'usr' as const, icon: 'users' as const, label: 'Usuarios', count: undefined },
      { key: 'cfg' as const, icon: 'gear' as const, label: 'Configuración', count: undefined },
    ],
  },
];

export function AdminSidebar({ currentView, onNavigate }: AdminSidebarProps) {
  return (
    <nav className="side" aria-label="Navegación principal">
      <div className="side-hd">
        <Emblem size={40} />
        <div className="wm">
          <b>Defensoría del Pueblo</b>
          <small>Gestión de PQR</small>
        </div>
      </div>
      <div className="side-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="grp">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'act' : ''}`}
                onClick={() => onNavigate(item.key)}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`cnt ${item.hot ? 'hot' : ''}`}>{item.count}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="side-ft">
        <div className="av">MR</div>
        <div className="tx">
          <b>Marcela Ríos</b>
          <small>Coordinadora · Bogotá</small>
        </div>
      </div>
    </nav>
  );
}
