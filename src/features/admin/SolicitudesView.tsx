import { useState } from 'react';
import { RECORDS } from '../../data/mockData';
import { ESTADOS, TIPOS } from '../../data/constants';
import type { AdminView } from '../../data/constants';

interface SolicitudesViewProps {
  onNavigate: (view: AdminView) => void;
}

const PAGE = 8;

export function SolicitudesView({ onNavigate }: SolicitudesViewProps) {
  const [page, setPage] = useState(1);
  const [fQ, setFQ] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [fDep, setFDep] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fUrg, setFUrg] = useState('');

  const stBadge = (e: string) =>
    ({ 'Recibida': 'b-grey', 'En análisis': 'b-gold', 'Asignada': 'b-navy', 'En trámite': 'b-navy', 'Finalizada': 'b-green' } as Record<string, string>)[e] || 'b-grey';

  const urgColor = (u: string) =>
    ({ 'Alta': 'var(--red)', 'Media': 'var(--gold)', 'Baja': '#9AA4B2' } as Record<string, string>)[u] || '#9AA4B2';

  const filtered = RECORDS.filter(
    (r) =>
      (!fQ || r.rad.toLowerCase().includes(fQ.toLowerCase()) || r.nombre.toLowerCase().includes(fQ.toLowerCase()) || r.asunto.toLowerCase().includes(fQ.toLowerCase())) &&
      (!fEstado || r.estado === fEstado) &&
      (!fDep || r.dep === fDep) &&
      (!fTipo || r.tipo === fTipo) &&
      (!fUrg || r.urg === fUrg),
  );

  const start = (page - 1) * PAGE;
  const rows = filtered.slice(start, start + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return (
    <div className="vpane on" id="v-sol">
      <div className="card">
        <div className="toolbar">
          <div className="search" style={{ width: 280 }}>
            <svg width="16" height="16" style={{ color: 'var(--ink-3)' }}>
              <use href="#i-search" />
            </svg>
            <input className="field" value={fQ} onChange={(e) => { setFQ(e.target.value); setPage(1); }} placeholder="Buscar por radicado o nombre" />
          </div>
          <select className="sel" value={fEstado} onChange={(e) => { setFEstado(e.target.value); setPage(1); }}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <select className="sel" value={fDep} onChange={(e) => { setFDep(e.target.value); setPage(1); }}>
            <option value="">Todos los departamentos</option>
            {[...new Set(RECORDS.map((r) => r.dep))].sort().map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="sel" value={fTipo} onChange={(e) => { setFTipo(e.target.value); setPage(1); }}>
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className="sel" value={fUrg} onChange={(e) => { setFUrg(e.target.value); setPage(1); }}>
            <option value="">Toda urgencia</option>
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
          <button className="btn btn-quiet btn-sm" onClick={() => { setFQ(''); setFEstado(''); setFDep(''); setFTipo(''); setFUrg(''); setPage(1); }}>
            Limpiar filtros
          </button>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Radicado</th><th>Ciudadano</th><th>Tipo</th><th>Asunto</th><th>Departamento</th><th>Estado</th><th>Urgencia</th><th>Radicada</th><th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? rows.map((r) => (
                <tr key={r.rad} onClick={() => onNavigate('det')} style={{ cursor: 'pointer' }}>
                  <td className="rad">{r.rad}</td>
                  <td><b style={{ fontWeight: 600 }}>{r.nombre}</b><div className="tiny muted">{r.doc}</div></td>
                  <td><span className="badge b-grey">{r.tipo}</span></td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.asunto}</td>
                  <td>{r.dep}<div className="tiny muted">{r.muni}</div></td>
                  <td><span className={`badge ${stBadge(r.estado)}`}><span className="dot" />{r.estado}</span></td>
                  <td><span className="urg"><i style={{ background: urgColor(r.urg) }} />{r.urg}</span></td>
                  <td className="num">{r.fecha}<div className="tiny muted">{r.hora}</div></td>
                  <td>{r.resp.split(' ')[0]} {r.resp.split(' ')[1] || ''}</td>
                </tr>
              )) : (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 44, color: 'var(--ink-3)' }}>
                  Ninguna solicitud coincide con estos filtros.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>{filtered.length > 0 ? `${start + 1}–${Math.min(start + PAGE, filtered.length)}` : '0'} de {filtered.length} solicitudes</span>
          <div className="pgbtns">
            {Array.from({ length: Math.min(pages, 6) }, (_, i) => i + 1).map((i) => (
              <button key={i} className={`pgbtn ${i === page ? 'act' : ''}`} onClick={() => setPage(i)}>{i}</button>
            ))}
            {pages > 6 && (
              <>
                <span style={{ padding: '0 6px', color: 'var(--ink-3)' }}>…</span>
                <button className={`pgbtn ${page === pages ? 'act' : ''}`} onClick={() => setPage(pages)}>{pages}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
