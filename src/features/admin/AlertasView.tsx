import { useState, useEffect } from 'react';
import { Kpi } from '../../components/ui/Kpi';
import { Icon } from '../../icons/Icons';
import { getActiveAlerts } from '../../lib/api';

interface Alert {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  case_number: string;
  created_at: string;
}

export function AlertasView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveAlerts()
      .then((data) => setAlerts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const urgentCount = alerts.filter(a => a.severity === 'red').length;
  const warningCount = alerts.filter(a => a.severity === 'gold').length;
  const totalAlerts = alerts.length;

  const cmap: Record<string, [string, string]> = {
    red: ['var(--red-050)', 'var(--red)'],
    gold: ['var(--gold-050)', '#B08A20'],
    navy: ['var(--navy-050)', 'var(--navy)'],
  };

  const notifs = [
    ['SI', 'Sistema conectado y operativo', 'Base de datos sincronizada', 'Ahora'],
    ['MR', 'Coordinador asignado al equipo', '4 funcionarios activos', 'Hoy'],
    ['PC', 'Análisis de casos completado', '50 casos procesados por IA', 'Hoy'],
    ['RB', 'Informe semanal disponible', 'Dashboard actualizado', 'Ayer'],
    ['SI', 'Reglas de priorización activas', 'Alertas automáticas habilitadas', 'Ayer'],
  ];

  return (
    <div className="vpane on" id="v-alert">
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Kpi label="Casos prioritarios" value={String(urgentCount)} detail="Requieren respuesta en 48 horas" icon="fire" hot />
        <Kpi label="Próximos a vencer" value={String(warningCount)} detail="Menos de 3 días de término" icon="clock" />
        <Kpi label="Vencidos" value={String(alerts.filter(a => a.alert_type === 'overdue').length)} detail="Requieren atención urgente" icon="alert" />
        <Kpi label="Total alertas" value={String(totalAlerts)} detail="Alertas activas del sistema" icon="shield" />
      </div>
      <div className="g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-hd">
            <h3>Alertas automáticas</h3>
            <span className="badge b-red"><span className="dot" />{totalAlerts} activas</span>
          </div>
          {loading ? (
            <div className="alert-card"><span className="muted">Cargando alertas...</span></div>
          ) : alerts.length === 0 ? (
            <div className="alert-card"><span className="muted">No hay alertas activas</span></div>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className="alert-card">
                <span className="ic" style={{ background: cmap[a.severity]?.[0] || 'var(--navy-050)', color: cmap[a.severity]?.[1] || 'var(--navy)' }}>
                  <Icon name={a.alert_type === 'overdue' ? 'clock' : a.alert_type === 'due_soon' ? 'alert' : 'fire'} size={17} />
                </span>
                <div className="bd"><b>{a.title}</b><p>{a.description}</p></div>
                <button className="btn btn-ghost btn-sm" style={{ flex: '0 0 auto' }}>Ver</button>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="card-hd">
            <h3>Actividad del sistema</h3>
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
