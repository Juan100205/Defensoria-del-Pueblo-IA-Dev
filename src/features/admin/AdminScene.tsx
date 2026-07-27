import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { DashboardView } from './DashboardView';
import { SolicitudesView } from './SolicitudesView';
import { DetalleView } from './DetalleView';
import { AlertasView } from './AlertasView';
import { AnaliticaView } from './AnaliticaView';
import { ExportacionesView } from './ExportacionesView';
import { UsuariosView } from './UsuariosView';
import { ConfiguracionView } from './ConfiguracionView';
import type { AdminView, Scene } from '../../data/constants';

interface AdminSceneProps {
  onNavigateScene: (scene: Scene) => void;
}

export function AdminScene({ onNavigateScene }: AdminSceneProps) {
  const [view, setView] = useState<AdminView>('dash');

  const renderView = () => {
    switch (view) {
      case 'dash': return <DashboardView />;
      case 'sol': return <SolicitudesView onNavigate={setView} />;
      case 'det': return <DetalleView />;
      case 'alert': return <AlertasView />;
      case 'ana': return <AnaliticaView />;
      case 'exp': return <ExportacionesView />;
      case 'usr': return <UsuariosView />;
      case 'cfg': return <ConfiguracionView />;
      default: return <DashboardView />;
    }
  };

  return (
    <section className="scene on" id="sc-admin">
      <div className="admin">
        <AdminSidebar currentView={view} onNavigate={setView} />
        <div className="main">
          <AdminTopBar currentView={view} onNavigateScene={onNavigateScene} />
          <div className="view">
            <div className="view-in">
              {renderView()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
