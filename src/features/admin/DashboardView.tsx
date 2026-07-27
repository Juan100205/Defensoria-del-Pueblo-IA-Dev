import { Kpi } from '../../components/ui/Kpi';
import { CITIES } from '../../data/constants';
import { Icon } from '../../icons/Icons';
import React from 'react';

export function DashboardView() {
  const kpis = [
    { label: 'PQR recibidas', value: '1.284', detail: <><span className="up">+12,4%</span> vs. mes anterior</>, icon: 'doc' as const },
    { label: 'En proceso', value: '248', detail: '62 asignadas hoy', icon: 'flow' as const },
    { label: 'Finalizadas', value: '987', detail: <><span className="up">96%</span> dentro del término</>, icon: 'checkc' as const },
    { label: 'Urgentes', value: '9', detail: 'Requieren acción en 48 h', icon: 'fire' as const, hot: true },
    { label: 'Tiempo promedio', value: '4,2 d', detail: <><span className="up">−0,8 d</span> vs. mes anterior</>, icon: 'clock' as const },
  ];

  const max = Math.max(...CITIES.map((c) => c.v));
  const top7 = [...CITIES].sort((a, b) => b.v - a.v).slice(0, 7);

  const feed = [
    { i: 'checkc' as const, c: 'green', t: <><b>DP-2026-014782</b> fue clasificada como Queja · Salud</>, s: 'Hace 2 minutos · Automático' },
    { i: 'fire' as const, c: 'red', t: <>Nuevo caso urgente en <b>Buenaventura</b></>, s: 'Hace 11 minutos · Detector de urgencia' },
    { i: 'users' as const, c: 'navy', t: <>Paula Cifuentes asumió <b>DP-2026-014756</b></>, s: 'Hace 26 minutos' },
    { i: 'mail' as const, c: 'navy', t: <>Respuesta de fondo enviada a 14 ciudadanos</>, s: 'Hace 1 hora' },
    { i: 'alert' as const, c: 'gold', t: <>3 solicitudes se vencen mañana en <b>Regional Nariño</b></>, s: 'Hace 2 horas' },
    { i: 'doc' as const, c: 'navy', t: <>Informe mensual de gestión generado</>, s: 'Hoy, 08:00' },
  ];

  const cmap: Record<string, [string, string]> = {
    green: ['var(--green-050)', 'var(--green)'],
    red: ['var(--red-050)', 'var(--red)'],
    navy: ['var(--navy-050)', 'var(--navy)'],
    gold: ['var(--gold-050)', '#B08A20'],
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
            <span className="badge b-grey">Últimos 30 días</span>
          </div>
          <div className="mapwrap">
            <svg className="co-map" viewBox="0 0 320 420" role="img" aria-label="Mapa de Colombia">
              <use href="#co-shape" fill="#DDE5F4" stroke="#fff" strokeWidth="2" />
              {CITIES.map((c) => {
                const r = 6 + (c.v / max) * 14;
                return (
                  <circle
                    key={c.n}
                    className="city"
                    cx={c.x}
                    cy={c.y}
                    r={r}
                    fill="#1E3A7B"
                    fillOpacity={(0.28 + 0.5 * c.v / max).toFixed(2)}
                    stroke="#1E3A7B"
                    strokeWidth="1.2"
                  >
                    <title>{c.n}: {c.v} solicitudes</title>
                  </circle>
                );
              })}
              {CITIES.filter((c) => c.v > 90).map((c) => (
                <text
                  key={c.n}
                  x={c.x + (c.x > 170 ? -1 : 1) * 20}
                  y={c.y + 4}
                  fontSize="9.5"
                  fill="#3B4653"
                  textAnchor={c.x > 170 ? 'end' : 'start'}
                >
                  {c.n}
                </text>
              ))}
            </svg>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Top departamentos</div>
              <ul className="map-list">
                {top7.map((c, i) => (
                  <li key={c.n}>
                    <span className="bx" style={{ background: `rgba(30,58,123,${(1 - i * 0.11).toFixed(2)})` }} />
                    {c.n}
                    <b>{c.v}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Solicitudes por semana</h3>
            <select className="sel" style={{ height: 30 }}>
              <option>12 semanas</option>
              <option>6 meses</option>
              <option>Año en curso</option>
            </select>
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--navy)' }} />Recibidas</span>
            <span><i style={{ background: 'var(--gold)' }} />Resueltas</span>
          </div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            <BarChart />
          </div>
        </div>
      </div>

      <div className="g3 mt16">
        <div className="card">
          <div className="card-hd"><h3>Por tipo de solicitud</h3></div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            {[
              { l: 'Petición', v: 412, c: '#1E3A7B' },
              { l: 'Queja', v: 338, c: '#2C4E9B' },
              { l: 'Reclamo', v: 246, c: '#4A6BB5' },
              { l: 'Denuncia DDHH', v: 158, c: '#F5C245' },
              { l: 'Tutela', v: 96, c: '#B4232A' },
              { l: 'Sugerencia', v: 34, c: '#8FA6D4' },
            ].map((d) => (
              <div key={d.l} style={{ marginBottom: 13 }}>
                <div className="row between" style={{ fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{d.l}</span>
                  <b className="num">{d.v}</b>
                </div>
                <div style={{ height: 7, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.v / 412 * 100).toFixed(1)}%`, background: d.c, borderRadius: 99, transition: 'width .8s var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><h3>Estado del inventario</h3></div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            <div className="row gap16" style={{ alignItems: 'center' }}>
              <svg viewBox="0 0 160 160" style={{ width: 150, flex: '0 0 auto' }}>
                {(() => {
                  const data = [
                    { l: 'Finalizadas', v: 987, c: '#1B7A4C' },
                    { l: 'En trámite', v: 186, c: '#1E3A7B' },
                    { l: 'En análisis', v: 62, c: '#F5C245' },
                    { l: 'Vencidas', v: 3, c: '#B4232A' },
                  ];
                  const total = data.reduce((s, d) => s + d.v, 0);
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
                  { l: 'Finalizadas', v: 987, c: '#1B7A4C' },
                  { l: 'En trámite', v: 186, c: '#1E3A7B' },
                  { l: 'En análisis', v: 62, c: '#F5C245' },
                  { l: 'Vencidas', v: 3, c: '#B4232A' },
                ].map((d) => (
                  <div key={d.l} className="row between" style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line-2)' }}>
                    <span className="row gap8">
                      <i style={{ width: 9, height: 9, borderRadius: 2, background: d.c, display: 'inline-block' }} />
                      {d.l}
                    </span>
                    <b className="num">{Math.round(d.v / 1238 * 100)}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Actividad reciente</h3>
          </div>
          <ul className="feed">
            {feed.map((f, i) => (
              <li key={i}>
                <span className="ic" style={{ background: cmap[f.c][0], color: cmap[f.c][1] }}>
                  <Icon name={f.i} size={15} />
                </span>
                <span className="tx">
                  {f.t}
                  <small>{f.s}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BarChart() {
  const data = [
    ['S23', 64, 52], ['S24', 78, 61], ['S25', 71, 68], ['S26', 92, 74],
    ['S27', 85, 80], ['S28', 103, 88], ['S29', 97, 91], ['S30', 88, 86],
    ['S31', 112, 95], ['S32', 104, 99], ['S33', 96, 102], ['S34', 121, 108],
  ] as const;

  const W = 560, H = 190, PL = 34, PB = 26, PT = 10;
  const max = Math.max(...data.flatMap((d) => [d[1], d[2]])) * 1.15;
  const gw = (W - PL - 8) / data.length;
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
      {data.map(([l, a, b], i) => {
        const x = PL + i * gw + gw / 2;
        const ha = (H - PT - PB) * (a / max);
        const hb = (H - PT - PB) * (b / max);
        return (
          <React.Fragment key={l}>
            <rect x={x - bw - 2} y={H - PB - ha} width={bw} height={ha} rx="2" fill="#1E3A7B">
              <title>{l}: {a} recibidas</title>
            </rect>
            <rect x={x + 2} y={H - PB - hb} width={bw} height={hb} rx="2" fill="#F5C245">
              <title>{l}: {b} resueltas</title>
            </rect>
            <text x={x} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#6B7684">{l}</text>
          </React.Fragment>
        );
      })}
    </svg>
  );
}
