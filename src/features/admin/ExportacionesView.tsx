import { useState } from 'react';
import { Icon } from '../../icons/Icons';

export function ExportacionesView() {
  const [selFmt, setSelFmt] = useState('Excel');

  const fmts = [
    { k: 'Excel', c: '#1B7A4C', d: 'Tabla completa con filtros aplicados' },
    { k: 'PDF', c: '#B4232A', d: 'Informe formateado con gráficos' },
    { k: 'CSV', c: '#1E3A7B', d: 'Datos crudos para otros sistemas' },
  ];

  return (
    <div className="vpane on" id="v-exp">
      <div className="g2">
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Nueva exportación</h3>
          <p className="small muted" style={{ marginTop: 8 }}>
            Elija el formato y el alcance de los datos. La descarga incluye únicamente los campos permitidos por su rol.
          </p>
          <div className="g3" style={{ marginTop: 16 }}>
            {fmts.map((f) => (
              <div
                key={f.k}
                className={`exp-card ${selFmt === f.k ? 'sel' : ''}`}
                onClick={() => setSelFmt(f.k)}
              >
                <div className="ic" style={{ background: f.c }}>{f.k === 'CSV' ? 'CSV' : f.k.slice(0, 3).toUpperCase()}</div>
                <b style={{ fontSize: 14 }}>{f.k}</b>
                <p className="tiny muted" style={{ marginTop: 4, lineHeight: 1.5 }}>{f.d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <label className="lbl">Rango de fechas</label>
            <div className="row gap8">
              <input className="field" type="date" defaultValue="2026-06-22" />
              <input className="field" type="date" defaultValue="2026-07-22" />
            </div>
            <label className="lbl" style={{ marginTop: 16 }}>Contenido</label>
            {['Datos de radicación', 'Información del ciudadano', 'Clasificación y resumen', 'Trazabilidad y comentarios', 'Archivos adjuntos'].map((l, i) => (
              <label key={l} className="cfg-row" style={{ cursor: 'pointer' }}>
                <span><b>{l}</b></span>
                <span className={`switch ${i < 3 ? 'on' : ''}`} />
              </label>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 16 }}>
              <Icon name="down" size={16} /> Generar exportación
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Informes programados</h3>
            <button className="btn btn-ghost btn-sm"><Icon name="plus" size={14} /> Nuevo</button>
          </div>
          {[
            ['Informe semanal de gestión', 'Cada lunes 07:00 · PDF · Dirección Nacional'],
            ['Inventario de casos urgentes', 'Diario 18:00 · Excel · Coordinadores'],
            ['Consolidado territorial', 'Primer día del mes · CSV · Planeación'],
          ].map(([t, s]) => (
            <div key={t} className="alert-card">
              <span className="ic" style={{ background: 'var(--navy-050)', color: 'var(--navy)' }}><Icon name="clock" size={16} /></span>
              <div className="bd"><b>{t}</b><p>{s}</p></div>
              <span className="switch on" style={{ flex: '0 0 auto', alignSelf: 'center' }} />
            </div>
          ))}
          <div className="card-hd" style={{ borderTop: '1px solid var(--line-2)' }}>
            <h3>Descargas recientes</h3>
          </div>
          {[
            ['solicitudes_julio_2026.xlsx', '2,4 MB · hoy 09:12 · Marcela Ríos'],
            ['informe_cumplimiento_junio.pdf', '1,1 MB · 01/07/2026 · Sistema'],
            ['consolidado_regionales.csv', '680 KB · 30/06/2026 · Ricardo Beltrán'],
          ].map(([n, s]) => (
            <div key={n} className="alert-card">
              <span className="ic" style={{ background: 'var(--navy-050)', color: 'var(--navy)' }}><Icon name="doc" size={16} /></span>
              <div className="bd"><b>{n}</b><p>{s}</p></div>
              <button className="btn btn-quiet btn-sm"><Icon name="down" size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
