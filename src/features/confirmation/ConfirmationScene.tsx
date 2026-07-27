import { Emblem, Icon } from '../../icons/Icons';
import { FlagLine } from '../../components/ui/FlagLine';
import { Badge } from '../../components/ui/Badge';
import type { Scene } from '../../data/constants';

interface ConfirmationSceneProps {
  radicado: string;
  fecha: string;
  hora: string;
  data: Record<string, string>;
  onNavigate: (scene: Scene) => void;
}

export function ConfirmationScene({ radicado, fecha, hora, data, onNavigate }: ConfirmationSceneProps) {
  return (
    <section className="scene on" id="sc-conf">
      <div className="chat-top">
        <div className="in">
          <div className="logo">
            <Emblem size={44} />
            <div className="wm">
              <b>Defensoría<br />del Pueblo</b>
              <span>COLOMBIA</span>
            </div>
          </div>
          <button className="btn btn-quiet btn-sm" onClick={() => onNavigate('portal')}>
            Volver al inicio
          </button>
        </div>
      </div>
      <FlagLine />

      <div className="conf">
        <div className="conf-in">
          <div className="check">
            <Icon name="check" size={30} style={{ color: 'var(--green)' }} />
          </div>
          <h2>Su solicitud quedó radicada</h2>
          <p className="sub">
            Guarde este número: con él puede consultar el estado en cualquier momento.
          </p>

          <div className="radicado">
            <div className="top">
              <div>
                <div className="eyebrow">Número de radicado</div>
                <div className="no">{radicado}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}
                onClick={() => navigator.clipboard?.writeText(radicado)}
              >
                <Icon name="copy" size={15} /> Copiar
              </button>
            </div>
            <div className="meta">
              <div><small>Fecha de radicación</small><b>{fecha}</b></div>
              <div><small>Hora</small><b>{hora}</b></div>
              <div><small>Estado inicial</small><b><Badge variant="navy" dot>Recibida</Badge></b></div>
            </div>
            <div className="bd">
              <div className="eyebrow" style={{ marginBottom: 14 }}>Resumen de lo que registramos</div>
              {[
                ['Ciudadano', data.nombre],
                ['Documento', data.documento],
                ['Correo', data.correo],
                ['Ciudad', data.ciudad],
                ['Tipo de solicitud', data.tipo],
                ['Soportes', data.archivos],
              ].map(([label, val]) => (
                <div key={label} className="summ-row">
                  <span>{label}</span>
                  <b>{val || '—'}</b>
                </div>
              ))}
              <div style={{ marginTop: 18, padding: '14px 16px', background: 'var(--navy-050)', borderRadius: 'var(--r-sm)', display: 'flex', gap: 11 }}>
                <Icon name="clock" size={18} style={{ color: 'var(--navy)', flex: '0 0 auto', marginTop: 1 }} />
                <p className="small" style={{ color: 'var(--navy-700)', lineHeight: 1.55 }}>
                  Tiempo estimado de respuesta: <b>15 días hábiles</b>. Si el caso se clasifica como urgente,
                  la primera respuesta llega en menos de 48 horas.
                </p>
              </div>
            </div>
          </div>

          <div className="conf-actions">
            <button className="btn btn-primary">
              <Icon name="down" size={17} /> Descargar comprobante
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('mail')}>
              <Icon name="mail" size={17} /> Enviar copia al correo
            </button>
            <button className="btn btn-quiet" onClick={() => onNavigate('portal')}>
              Radicar otra solicitud
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
