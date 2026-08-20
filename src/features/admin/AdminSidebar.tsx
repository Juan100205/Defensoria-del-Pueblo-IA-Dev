import { useState, useEffect } from 'react';
import { Emblem, Icon } from '../../icons/Icons';
import { getTotalCasesCount, getAlertsCount } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AdminView } from '../../data/constants';

interface AdminSidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
}

export function AdminSidebar({ currentView, onNavigate }: AdminSidebarProps) {
  const [caseCount, setCaseCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    getTotalCasesCount().then(c => setCaseCount(Number(c) || 0)).catch(() => {});
    getAlertsCount().then(c => setAlertCount(Number(c) || 0)).catch(() => {});
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const navGroups = [
    {
      label: 'Operación',
      items: [
        { key: 'dash' as const, icon: 'grid' as const, label: 'Dashboard', count: undefined },
        { key: 'sol' as const, icon: 'list' as const, label: 'Solicitudes', count: caseCount },
        { key: 'det' as const, icon: 'eye' as const, label: 'Visualizador', count: undefined },
        { key: 'alert' as const, icon: 'alert' as const, label: 'Alertas', count: alertCount, hot: alertCount > 0 },
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
        <div className="av">{initials}</div>
        <div className="tx">
          <b>{profile?.full_name || 'Usuario'}</b>
          <small>{profile?.role === 'administrador' ? 'Administrador' : profile?.role || 'Sin rol'}</small>
        </div>
      </div>
    </nav>
  );
}
