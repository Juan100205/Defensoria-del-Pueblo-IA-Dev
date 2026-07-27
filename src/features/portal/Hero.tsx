import { Icon } from '../../icons/Icons';
import type { Scene } from '../../data/constants';

interface HeroProps {
  onNavigate: (scene: Scene) => void;
  onOpenModal: (title: string, body: string, footer?: string) => void;
}

export function Hero({ onNavigate, onOpenModal }: HeroProps) {
  return (
    <div className="hero">
      <div>
        <div className="eyebrow" style={{ color: 'var(--navy)' }}>
          Peticiones, quejas y reclamos
        </div>
        <h1 style={{ marginTop: 14 }}>
          Cuéntenos qué pasó.<br />
          <em>Nosotros lo guiamos</em><br />
          paso a paso.
        </h1>
        <p className="lead">
          Radique su solicitud conversando con nuestro asistente. Le hacemos una pregunta a la vez,
          sin formularios largos, y le entregamos su número de radicado al terminar.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('chat')}>
            <Icon name="chat" size={20} /> Radicar una PQR
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() =>
              onOpenModal(
                'Consultar mi radicado',
                `<label class="lbl">Número de radicado</label><input class="field" placeholder="DP-2026-014782">
                 <label class="lbl mt16">Documento de identidad</label><input class="field" placeholder="Sin puntos ni comas">
                 <p class="small muted mt16">Le mostraremos el estado actual, la dependencia a cargo y la fecha estimada de respuesta.</p>`,
              )
            }
          >
            Consultar mi radicado
          </button>
        </div>
        <div className="hero-note">
          <span><Icon name="clock" size={15} style={{ color: 'var(--green)' }} /> Toma cerca de 4 minutos</span>
          <span><Icon name="lock" size={15} style={{ color: 'var(--green)' }} /> Datos protegidos · Ley 1581 de 2012</span>
          <span><Icon name="shield" size={15} style={{ color: 'var(--green)' }} /> Servicio gratuito</span>
        </div>
      </div>
      <aside className="route" aria-label="Ruta de la solicitud">
        <h4>Ruta de su solicitud</h4>
        <ol>
          <li className="on">
            <span className="mk">1</span>
            <span className="tx"><b>Radicación asistida</b><small>Responde las preguntas del asistente y adjunta lo que tengas a mano.</small></span>
          </li>
          <li>
            <span className="mk">2</span>
            <span className="tx"><b>Constancia inmediata</b><small>Recibes número de radicado en pantalla y en tu correo.</small></span>
          </li>
          <li>
            <span className="mk">3</span>
            <span className="tx"><b>Análisis y clasificación</b><small>La Defensoría organiza tu caso y define su prioridad.</small></span>
          </li>
          <li>
            <span className="mk">4</span>
            <span className="tx"><b>Asignación a la dependencia</b><small>Un funcionario responsable queda a cargo del seguimiento.</small></span>
          </li>
          <li>
            <span className="mk">5</span>
            <span className="tx"><b>Respuesta de fondo</b><small>Máximo 15 días hábiles, según el tipo de solicitud.</small></span>
          </li>
        </ol>
      </aside>
    </div>
  );
}
