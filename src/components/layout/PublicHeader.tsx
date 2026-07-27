import { Emblem } from '../../icons/Icons';
import type { Scene } from '../../data/constants';

interface PublicHeaderProps {
  currentScene: Scene;
  onNavigate: (scene: Scene) => void;
}

export function PublicHeader({ currentScene, onNavigate }: PublicHeaderProps) {
  return (
    <>
      <header className="pub-head">
        <div className="in">
          <div className="logo">
            <Emblem size={52} />
            <div className="wm">
              <b>Defensoría<br />del Pueblo</b>
              <span>COLOMBIA</span>
            </div>
          </div>
          <nav className="pub-nav">
            <a href="#" className={currentScene === 'portal' ? 'act' : ''} onClick={(e) => { e.preventDefault(); onNavigate('portal'); }}>Inicio</a>
            <a href="#">La Defensoría</a>
            <a href="#">Servicios</a>
            <a href="#">Consultar radicado</a>
            <a href="#">Transparencia</a>
          </nav>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('admin')}>
            Ingreso funcionarios
          </button>
        </div>
      </header>
    </>
  );
}
