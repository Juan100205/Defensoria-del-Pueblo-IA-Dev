import { Icon } from '../../icons/Icons';
import { FlagLine } from '../../components/ui/FlagLine';
import { Badge } from '../../components/ui/Badge';
import type { Scene } from '../../data/constants';

interface MailSceneProps {
  radicado: string;
  correo: string;
  hora: string;
  data: Record<string, string>;
  onNavigate: (scene: Scene) => void;
}

export function MailScene({ radicado, correo, hora, data, onNavigate }: MailSceneProps) {
  return (
    <section className="scene on" id="sc-mail">
      <div className="chat-top">
        <div className="in">
          <div className="row gap12">
            <span className="eyebrow">Paso 4 de la ruta</span>
            <b style={{ fontSize: 14 }}>Confirmación enviada al ciudadano</b>
          </div>
          <div className="row gap8">
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('conf')}>
              <Icon name="back" size={15} /> Volver
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('proc')}>
              Ver el proceso interno <Icon name="arrow" size={15} />
            </button>
          </div>
        </div>
      </div>
      <FlagLine />

      <div className="mail-scene">
        <div className="mail-in">
          <div className="mailbox">
            <div className="mail-bar">
              <span className="dots"><i /><i /><i /></span>
              <span className="url">Bandeja de entrada — <b>{correo}</b></span>
            </div>
            <div className="mail-hd">
              <h3>
                Radicado {radicado} · Confirmación de su solicitud
              </h3>
              <div className="mail-from">
                <div className="av">DP</div>
                <div>
                  <b style={{ fontSize: 13.5 }}>Defensoría del Pueblo</b>
                  <div className="small muted">notificaciones@defensoria.gov.co · hoy, {hora}</div>
                </div>
                <Badge variant="green" dot style={{ marginLeft: 'auto' }}>Remitente verificado</Badge>
              </div>
            </div>
            <div className="mail-body">
              <div className="mail-hero">
                <div className="eyebrow" style={{ color: '#9DB2DB' }}>Su solicitud fue recibida</div>
                <div className="no">{radicado}</div>
                <p className="small" style={{ color: '#B9C8E6', marginTop: 8 }}>
                  Conserve este número para cualquier consulta.
                </p>
              </div>
              <table className="mail-tbl">
                <tbody>
                  {[
                    ['Radicado', radicado],
                    ['Fecha de recepción', `hoy ${hora}`],
                    ['Tipo de solicitud', data.tipo || '—'],
                    ['Estado inicial', 'Recibida — en cola de análisis'],
                    ['Tiempo estimado de respuesta', '15 días hábiles'],
                    ['Resumen', (data.descripcion || '').slice(0, 180) + '…'],
                    ['Dependencia probable', 'Delegada para la Salud'],
                  ].map(([a, b]) => (
                    <tr key={a}><td>{a}</td><td>{b}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 26, padding: 18, border: '1px solid var(--line)', borderRadius: 'var(--r)' }}>
                <b style={{ fontSize: 14 }}>¿Qué sigue ahora?</b>
                <p className="small muted" style={{ marginTop: 8, lineHeight: 1.65 }}>
                  Su caso ya está en el sistema de la Defensoría. Será clasificado, priorizado y asignado
                  a la dependencia competente. Le escribiremos cada vez que cambie de estado.
                </p>
                <button className="btn btn-primary btn-sm mt16" onClick={() => onNavigate('proc')}>
                  Ver el estado de mi solicitud
                </button>
              </div>
              <p className="tiny muted" style={{ marginTop: 24, lineHeight: 1.6 }}>
                Este mensaje se generó automáticamente; por favor no responda a esta dirección. Sus datos
                personales son tratados conforme a la Ley 1581 de 2012 y la política institucional de
                tratamiento de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
