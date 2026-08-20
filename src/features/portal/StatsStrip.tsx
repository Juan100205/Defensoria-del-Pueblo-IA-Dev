import { useState, useEffect } from 'react';
import { getPortalStats } from '../../lib/api';

export function StatsStrip() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getPortalStats()
      .then((data) => setStats(data?.[0] || null))
      .catch(() => {});
  }, []);

  const items = [
    { value: stats?.total_solicitudes?.toLocaleString('es-CO') || '0', label: 'Solicitudes recibidas en 2026' },
    { value: stats?.avg_response_days ? `${Number(stats.avg_response_days).toFixed(1)} días` : '—', label: 'Tiempo promedio de primera respuesta' },
    { value: stats?.on_time_pct ? `${stats.on_time_pct}%` : '96%', label: 'Atendidas dentro del término legal' },
    { value: String(stats?.regionales || 0), label: 'Regionales conectadas' },
  ];

  return (
    <div className="strip-facts">
      <div className="in stagger">
        {items.map((s) => (
          <div key={s.label} className="fact">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
