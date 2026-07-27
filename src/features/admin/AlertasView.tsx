import { Kpi } from '../../components/ui/Kpi';
import { Icon } from '../../icons/Icons';

export function AlertasView() {
  const alerts = [
    { c: 'red', i: 'fire' as const, t: 'Caso sensible sin asignar hace 6 horas', p: 'DP-2026-014733 · Denuncia DDHH en Tumaco (Nariño). Supera el tiempo máximo de asignación.', b: 'Asignar ahora' },
    { c: 'red', i: 'clock' as const, t: '3 solicitudes vencieron su término', p: 'Regional Nariño y Regional Chocó. El vencimiento se reporta al informe de cumplimiento del mes.', b: 'Ver casos' },
    { c: 'gold', i: 'alert' as const, t: '14 casos vencen en menos de 3 días', p: 'La mayoría corresponde a peticiones en salud pendientes de respuesta de la entidad accionada.', b: 'Priorizar' },
    { c: 'gold', i: 'copy' as const, t: 'Posible duplicado detectado', p: 'DP-2026-014770 comparte cédula, entidad y hechos con DP-2026-014612 radicada hace 9 días.', b: 'Comparar' },
    { c: 'navy', i: 'users' as const, t: 'Carga desbalanceada en Regional Valle', p: 'Sara Guerrero acumula 19 casos activos frente a un promedio de 11 en su dependencia.', b: 'Redistribuir' },
    { c: 'navy', i: 'shield' as const, t: '6 casos marcados como sensibles', p: 'Acceso restringido a los roles autorizados. Toda consulta queda auditada.', b: 'Revisar accesos' },
  ];

  const cmap: Record<string, [string, string]> = {
    red: ['var(--red-050)', 'var(--red)'],
    gold: ['var(--gold-050)', '#B08A20'],
    navy: ['var(--navy-050)', 'var(--navy)'],
  };

  const notifs = [
    ['MR', 'Marcela Ríos le asignó una solicitud', 'DP-2026-014782 · Queja en salud', 'Hace 5 min'],
    ['SI', 'El sistema cerró 12 casos por respuesta de fondo', 'Regional Antioquia', 'Hace 40 min'],
    ['PC', 'Paula Cifuentes comentó en DP-2026-014756', '"Adjunté la respuesta de la entidad"', 'Hace 1 h'],
    ['RB', 'Ricardo Beltrán publicó el informe semanal', 'Disponible en Exportaciones', 'Ayer'],
    ['SI', 'Actualización de la regla de priorización', 'Adultos mayores con caso en salud', 'Ayer'],
  ];

  return (
    <div className="vpane on" id="v-alert">
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Kpi label="Casos prioritarios" value="9" detail="Requieren respuesta en 48 horas" icon="fire" hot />
        <Kpi label="Próximos a vencer" value="14" detail="Menos de 3 días de término" icon="clock" />
        <Kpi label="Vencidos" value="3" detail={<><span className="dn">+1</span> frente a ayer</>} icon="alert" />
        <Kpi label="Casos sensibles" value="6" detail="Acceso restringido" icon="shield" />
      </div>
      <div className="g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-hd">
            <h3>Alertas automáticas</h3>
            <span className="badge b-red"><span className="dot" />9 sin atender</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} className="alert-card">
              <span className="ic" style={{ background: cmap[a.c][0], color: cmap[a.c][1] }}>
                <Icon name={a.i} size={17} />
              </span>
              <div className="bd"><b>{a.t}</b><p>{a.p}</p></div>
              <button className="btn btn-ghost btn-sm" style={{ flex: '0 0 auto' }}>{a.b}</button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-hd">
            <h3>Notificaciones del equipo</h3>
            <button className="btn btn-quiet btn-sm">Marcar todo como leído</button>
          </div>
          {notifs.map(([ini, t, s, tm], i) => (
            <div key={i} className="alert-card">
              <span className="ic" style={{ background: 'var(--navy-050)', color: 'var(--navy)', fontSize: 11, fontWeight: 700 }}>{ini}</span>
              <div className="bd"><b>{t}</b><p>{s}</p></div>
              <span className="tiny muted" style={{ flex: '0 0 auto' }}>{tm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
