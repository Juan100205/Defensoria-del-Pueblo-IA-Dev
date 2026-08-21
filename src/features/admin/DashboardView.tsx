import { useState, useEffect } from 'react';
import { Kpi } from '../../components/ui/Kpi';
import { Icon } from '../../icons/Icons';
import { getDashboardStats, getCasesByDepartment, getCasesByType, getCasesByWeek, getRecentActivity } from '../../lib/api';
import React from 'react';

interface DeptRow { department: string; count: number }
interface TypeRow { type_name: string; count: number }
interface WeekRow { week_label: string; number: number; received: number; resolved: number }
interface ActivityRow { icon: string; color: string; title: string; subtitle: string; created_at: string }

const CITIES: Record<string, { x: number; y: number }> = {
  'Bogotá D.C.': { x: 168, y: 232 },
  'Antioquia': { x: 120, y: 158 },
  'Valle del Cauca': { x: 100, y: 236 },
  'Atlántico': { x: 172, y: 66 },
  'Bolívar': { x: 150, y: 72 },
  'Santander': { x: 196, y: 134 },
  'Norte de Santander': { x: 220, y: 114 },
  'Nariño': { x: 106, y: 290 },
  'Chocó': { x: 80, y: 150 },
  'Huila': { x: 138, y: 262 },
  'Magdalena': { x: 190, y: 66 },
  'Córdoba': { x: 126, y: 96 },
  'Amazonas': { x: 192, y: 382 },
  'Cauca': { x: 106, y: 258 },
  'Meta': { x: 198, y: 232 },
}

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [depts, setDepts] = useState<DeptRow[]>([]);
  const [types, setTypes] = useState<TypeRow[]>([]);
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const [feed, setFeed] = useState<ActivityRow[]>([]);
  useEffect(() => {
    Promise.all([
      getDashboardStats().then(d => setStats(d)),
      getCasesByDepartment().then(d => setDepts(d || [])),
      getCasesByType().then(d => setTypes(d || [])),
      getCasesByWeek().then(d => setWeeks(d || [])),
      getRecentActivity().then(d => setFeed(d || [])),
    ]).catch(() => {});
  }, []);

  const kpis = [
    { label: 'PQR recibidas', value: stats?.total_cases?.toLocaleString() || '0', detail: <><span className="up">{stats?.active_cases || 0} activas</span></>, icon: 'doc' as const },
    { label: 'En proceso', value: String(stats?.active_cases || 0), detail: `${stats?.urgent_cases || 0} urgentes`, icon: 'flow' as const },
    { label: 'Finalizadas', value: String(stats?.resolved_this_month || 0), detail: <><span className="up">Este mes</span></>, icon: 'checkc' as const },
    { label: 'Urgentes', value: String(stats?.urgent_cases || 0), detail: 'Requieren acción en 48 h', icon: 'fire' as const, hot: true },
    { label: 'Tiempo promedio', value: stats?.avg_response_days ? `${Number(stats.avg_response_days).toFixed(1)} d` : '—', detail: 'Últimos 30 días', icon: 'clock' as const },
  ];

  const maxDept = Math.max(...depts.map(d => d.count), 1);
  const top7 = [...depts].sort((a, b) => b.count - a.count).slice(0, 7);

  const maxType = Math.max(...types.map(t => t.count), 1);

  const cmap: Record<string, [string, string]> = {
    green: ['var(--green-050)', 'var(--green)'],
    red: ['var(--red-050)', 'var(--red)'],
    navy: ['var(--navy-050)', 'var(--navy)'],
    gold: ['var(--gold-050)', '#B08A20'],
  };

  const typeColors: Record<string, string> = {
    'Petición': '#1E3A7B',
    'Queja': '#2C4E9B',
    'Reclamo': '#4A6BB5',
    'Denuncia DDHH': '#F5C245',
    'Tutela': '#B4232A',
    'Sugerencia': '#8FA6D4',
  };

  return (
    <div className="vpane on" id="v-dash">
      <div className="kpis stagger">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <div className="g-map mt16">
        <div className="card">
          <div className="card-hd">
            <h3>Distribución territorial</h3>
            <span className="badge b-grey">Todos los casos</span>
          </div>
          <div className="mapwrap">
            <svg className="co-map" viewBox="0 0 320 420" role="img" aria-label="Mapa de Colombia">
              <use href="#co-shape" fill="#DDE5F4" stroke="#fff" strokeWidth="2" />
              {depts.map((d) => {
                const city = CITIES[d.department];
                if (!city) return null;
                const r = 6 + (d.count / maxDept) * 14;
                return (
                  <circle
                    key={d.department}
                    className="city"
                    cx={city.x}
                    cy={city.y}
                    r={r}
                    fill="#1E3A7B"
                    fillOpacity={(0.28 + 0.5 * d.count / maxDept).toFixed(2)}
                    stroke="#1E3A7B"
                    strokeWidth="1.2"
                  >
                    <title>{d.department}: {d.count} solicitudes</title>
                  </circle>
                );
              })}
              {depts.filter(d => d.count > 4).map((d) => {
                const city = CITIES[d.department];
                if (!city) return null;
                return (
                  <text
                    key={d.department}
                    x={city.x + (city.x > 170 ? -1 : 1) * 20}
                    y={city.y + 4}
                    fontSize="9.5"
                    fill="#3B4653"
                    textAnchor={city.x > 170 ? 'end' : 'start'}
                  >
                    {d.department}
                  </text>
                );
              })}
            </svg>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Top departamentos</div>
              <ul className="map-list">
                {top7.map((d, i) => (
                  <li key={d.department}>
                    <span className="bx" style={{ background: `rgba(30,58,123,${(1 - i * 0.11).toFixed(2)})` }} />
                    {d.department}
                    <b>{d.count}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Solicitudes por semana</h3>
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--navy)' }} />Recibidas</span>
            <span><i style={{ background: 'var(--gold)' }} />Resueltas</span>
          </div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            <BarChart data={weeks} />
          </div>
        </div>
      </div>

      <div className="g3 mt16">
        <div className="card">
          <div className="card-hd"><h3>Actividad reciente</h3></div>
          <ul className="feed">
            {feed.map((f, i) => (
              <li key={i}>
                <span className="ic" style={{ background: cmap[f.color]?.[0] || 'var(--navy-050)', color: cmap[f.color]?.[1] || 'var(--navy)' }}>
                  <Icon name={f.icon as any} size={15} />
                </span>
                <span className="tx">
                  {f.title}
                  <small>{f.subtitle}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-hd"><h3>Estado del inventario</h3></div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            <div className="row gap16" style={{ alignItems: 'center' }}>
              <svg viewBox="0 0 160 160" style={{ width: 150, flex: '0 0 auto' }}>
                {(() => {
                  const data = [
                    { l: 'Activos', v: stats?.active_cases || 0, c: '#1E3A7B' },
                    { l: 'Finalizados', v: stats?.resolved_this_month || 0, c: '#1B7A4C' },
                    { l: 'Urgentes', v: stats?.urgent_cases || 0, c: '#B4232A' },
                  ];
                  const total = data.reduce((s, d) => s + d.v, 0) || 1;
                  const C = 2 * Math.PI * 54;
                  let off = 0;
                  return (
                    <>
                      {data.map((d) => {
                        const len = C * (d.v / total);
                        const el = (
                          <circle
                            key={d.l}
                            cx="80" cy="80" r="54"
                            fill="none" stroke={d.c} strokeWidth="20"
                            strokeDasharray={`${len - 2} ${C - len + 2}`}
                            strokeDashoffset={-off}
                            transform="rotate(-90 80 80)"
                          >
                            <title>{d.l}: {d.v}</title>
                          </circle>
                        );
                        off += len;
                        return el;
                      })}
                      <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="700" fill="#12181F">{total.toLocaleString('es-CO')}</text>
                      <text x="80" y="94" textAnchor="middle" fontSize="10.5" fill="#6B7684">solicitudes</text>
                    </>
                  );
                })()}
              </svg>
              <div style={{ flex: 1 }}>
                {[
                  { l: 'Activos', v: stats?.active_cases || 0, c: '#1E3A7B' },
                  { l: 'Finalizados', v: stats?.resolved_this_month || 0, c: '#1B7A4C' },
                  { l: 'Urgentes', v: stats?.urgent_cases || 0, c: '#B4232A' },
                ].map((d) => (
                  <div key={d.l} className="row between" style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line-2)' }}>
                    <span className="row gap8">
                      <i style={{ width: 9, height: 9, borderRadius: 2, background: d.c, display: 'inline-block' }} />
                      {d.l}
                    </span>
                    <b className="num">{d.v}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><h3>Por tipo de solicitud</h3></div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            {types.map((d) => (
              <div key={d.type_name} style={{ marginBottom: 13 }}>
                <div className="row between" style={{ fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{d.type_name}</span>
                  <b className="num">{d.count}</b>
                </div>
                <div style={{ height: 7, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.count / maxType * 100).toFixed(1)}%`, background: typeColors[d.type_name] || '#1E3A7B', borderRadius: 99, transition: 'width .8s var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: WeekRow[] }) {
  const W = 560, H = 190, PL = 34, PB = 26, PT = 10;
  const max = Math.max(...data.flatMap((d) => [d.received, d.resolved]), 1) * 1.15;
  const gw = (W - PL - 8) / Math.max(data.length, 1);
  const bw = gw * 0.32;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PT + (H - PT - PB) * (1 - t);
        return (
          <React.Fragment key={t}>
            <line x1={PL} x2={W} y1={y} y2={y} stroke="#EEF0F4" />
            <text x={PL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#6B7684">{Math.round(max * t)}</text>
          </React.Fragment>
        );
      })}
      {data.map((d, i) => {
        const x = PL + i * gw + gw / 2;
        const ha = (H - PT - PB) * (d.received / max);
        const hb = (H - PT - PB) * (d.resolved / max);
        return (
          <React.Fragment key={d.week_label}>
            <rect x={x - bw - 2} y={H - PB - ha} width={bw} height={ha} rx="2" fill="#1E3A7B">
              <title>{d.week_label}: {d.received} recibidas</title>
            </rect>
            <rect x={x + 2} y={H - PB - hb} width={bw} height={hb} rx="2" fill="#F5C245">
              <title>{d.week_label}: {d.resolved} resueltas</title>
            </rect>
            <text x={x} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#6B7684">{d.week_label}</text>
          </React.Fragment>
        );
      })}
    </svg>
  );
}
