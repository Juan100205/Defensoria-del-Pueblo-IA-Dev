import { Emblem } from '../../icons/Icons';
import { Badge } from '../ui/Badge';
import type { Scene } from '../../data/constants';
import { Icon } from '../../icons/Icons';

interface ChatHeaderProps {
  onNavigate: (scene: Scene) => void;
}

export function ChatHeader({ onNavigate }: ChatHeaderProps) {
  return (
    <>
      <div className="chat-top">
        <div className="in">
          <div className="logo">
            <Emblem size={44} />
            <div className="wm">
              <b>Defensoría<br />del Pueblo</b>
              <span>COLOMBIA</span>
            </div>
          </div>
          <div className="row gap12">
            <Badge variant="green" dot>Sesión segura</Badge>
            <button className="btn btn-quiet btn-sm" onClick={() => onNavigate('portal')}>
              <Icon name="back" size={15} /> Salir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
