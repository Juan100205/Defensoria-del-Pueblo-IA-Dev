import React from 'react';

export function AnaliticaView() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];

  let seed = 42;
  function sr() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  function pint(a: number, b: number) { return Math.floor(sr() * (b - a + 1)) + a; }

  const lineVals = () => {
    const vals: number[] = [];
    let v = 28;
    for (let i = 0; i < 90; i++) {
      v = Math.max(12, Math.min(72, v + pint(-7, 8) + (i % 7 === 0 ? 6 : 0)));
      vals.push(v);
    }
    return vals;
  };

  const vals = lineVals();
  const W = 560, H = 200, PL = 32, PB = 24, PT = 12;
  const max = Math.max(...vals) * 1.2;
  const step = (W - PL - 6) / (vals.length - 1);
  const pts = vals.map((v, i) => [PL + i * step, PT + (H - PT - PB) * (1 - v / max)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${(p[0] as number).toFixed(1)} ${(p[1] as number).toFixed(1)}`).join(' ');
  const area = line + ` L${W - 6} ${H - PB} L${PL} ${H - PB} Z`;

  return (
    <div className="vpane on" id="v-ana">
      <div className="g2">
        <div className="card">
          <div className="card-hd">
            <h3>Serie temporal · solicitudes diarias</h3>
            <span className="badge b-grey">90 días</span>
          </div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
              {[0, 0.5, 1].map((t) => {
                const y = PT + (H - PT - PB) * (1 - t);
                return (
                  <React.Fragment key={t}>
                    <line x1={PL} x2={W} y1={y} y2={y} stroke="#EEF0F4" />
                    <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#6B7684">{Math.round(max * t)}</text>
                  </React.Fragment>
                );
              })}
              {['Abr', 'May', 'Jun', 'Jul'].map((m, i) => (
                <text key={m} x={PL + (W - PL - 6) * (i / 3.2) + 10} y={H - 6} fontSize="10" fill="#6B7684">{m}</text>
              ))}
              <path d={area} fill="rgba(30,58,123,.08)" />
              <path d={line} fill="none" stroke="#1E3A7B" strokeWidth="2" strokeLinejoin="round" />
              {pts.filter((_, i) => i % 9 === 0).map((p, i) => (
                <circle key={i} cx={(p[0] as number).toFixed(1)} cy={(p[1] as number).toFixed(1)} r="3" fill="#fff" stroke="#1E3A7B" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><h3>Tiempo de respuesta por dependencia</h3></div>
          <div className="chart" style={{ padding: '8px 20px 18px' }}>
            {[
              { l: 'Delegada para la Salud', v: 3.1, s: '3,1 días', c: '#1B7A4C' },
              { l: 'Delegada para Víctimas', v: 4.4, s: '4,4 días', c: '#1E3A7B' },
              { l: 'Regional Antioquia', v: 5.2, s: '5,2 días', c: '#1E3A7B' },
              { l: 'Regional Valle', v: 6.8, s: '6,8 días', c: '#F5C245' },
              { l: 'Regional Nariño', v: 9.4, s: '9,4 días', c: '#B4232A' },
            ].map((d) => (
              <div key={d.l} style={{ marginBottom: 13 }}>
                <div className="row between" style={{ fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{d.l}</span>
                  <b className="num">{d.s}</b>
                </div>
                <div style={{ height: 7, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.v / 9.4 * 100).toFixed(1)}%`, background: d.c, borderRadius: 99, transition: 'width .8s var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hd">
          <h3>Mapa de calor · solicitudes por día y hora</h3>
          <span className="small muted">Concentración en horario de atención</span>
        </div>
        <div className="chart" style={{ padding: '8px 20px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `70px repeat(${hours.length}, 1fr)`, gap: 3, fontSize: 11, alignItems: 'center' }}>
            <div />
            {hours.map((h) => <div key={h} style={{ color: 'var(--ink-3)', fontWeight: 600, fontSize: 11.5, textAlign: 'center' }}>{h}</div>)}
            {days.map((d, di) => (
              <React.Fragment key={d}>
                <div style={{ color: 'var(--ink-3)', fontWeight: 600, fontSize: 11.5 }}>{d}</div>
                {hours.map((_, hi) => {
                  const base = di > 4 ? 0.18 : 0.5;
                  const peak = 1 - Math.abs(hi - 4) / 9;
                  const val = Math.max(0.05, Math.min(1, base * peak * 2 + sr() * 0.22));
                  return <div key={hi} style={{ aspectRatio: 1, borderRadius: 3, background: `rgba(30,58,123,${val.toFixed(2)})`, transition: 'transform .15s', cursor: 'pointer' }} title={`${d} ${hours[hi]}:00 — ${Math.round(val * 46)} solicitudes`} />;
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="row gap8" style={{ marginTop: 16, justifyContent: 'flex-end', fontSize: 11.5, color: 'var(--ink-3)' }}>
            Menos {[0.12, 0.3, 0.5, 0.7, 0.9].map((o) => (
              <i key={o} style={{ width: 16, height: 12, borderRadius: 2, background: `rgba(30,58,123,${o})`, display: 'inline-block' }} />
            ))} Más
          </div>
        </div>
      </div>

      <div className="g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-hd"><h3>Comparativo por regional</h3></div>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Regional</th><th>Recibidas</th><th>Resueltas</th><th>Cumplimiento</th><th>Variación</th></tr></thead>
              <tbody>
                {[
                  ['Bogotá D.C.', 312, 296, '95%', '+8,2%'],
                  ['Antioquia', 248, 241, '97%', '+4,1%'],
                  ['Valle del Cauca', 196, 178, '91%', '−2,4%'],
                  ['Atlántico', 148, 144, '97%', '+11,0%'],
                  ['Nariño', 82, 68, '83%', '−6,7%'],
                  ['Chocó', 64, 52, '81%', '+1,2%'],
                ].map(([r, a, b, c, d]) => (
                  <tr key={r as string}>
                    <td><b style={{ fontWeight: 600 }}>{r}</b></td>
                    <td className="num">{String(a)}</td>
                    <td className="num">{String(b)}</td>
                    <td><span className={`badge ${parseInt(c as string) >= 95 ? 'b-green' : parseInt(c as string) >= 90 ? 'b-gold' : 'b-red'}`}>{c}</span></td>
                    <td className="num" style={{ color: (d as string).startsWith('−') ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{String(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><h3>Indicadores de gestión</h3></div>
          <div className="card-p">
            {[
              ['Cumplimiento del término legal', '96,2%', '+1,4 pts', 'up'],
              ['Casos resueltos en primera respuesta', '71,8%', '+3,1 pts', 'up'],
              ['Solicitudes reclasificadas manualmente', '4,6%', '−2,2 pts', 'up'],
              ['Satisfacción del ciudadano (encuesta)', '4,5 / 5', '+0,2', 'up'],
              ['Casos reabiertos', '2,8%', '+0,4 pts', 'dn'],
            ].map(([l, v, d, c]) => (
              <div key={l as string} className="cfg-row">
                <div><b>{l}</b><small>Últimos 30 días</small></div>
                <div style={{ textAlign: 'right' }}>
                  <b className="num" style={{ fontSize: 18 }}>{v}</b>
                  <small className={c as string} style={{ color: c === 'up' ? 'var(--green)' : 'var(--red)', fontWeight: 700, display: 'block' }}>{d}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
