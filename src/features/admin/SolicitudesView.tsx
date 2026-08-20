import { useState, useEffect, useCallback } from 'react';
import { ESTADOS, TIPOS } from '../../data/constants';
import { getCases } from '../../lib/api';
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
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCases({
        query: fQ || undefined,
        status: fEstado || undefined,
        department: fDep || undefined,
        complaint_type: fTipo || undefined,
        urgency: fUrg || undefined,
        page,
        page_size: PAGE,
      });
      setRows(result || []);
      setTotal(result?.[0]?.total_count || 0);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setRows([]);
      setTotal(0);
    }
    setLoading(false);
  }, [fQ, fEstado, fDep, fTipo, fUrg, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stBadge = (e: string) =>
    ({ 'recibida': 'b-grey', 'en_analisis': 'b-gold', 'asignada': 'b-navy', 'en_tramite': 'b-navy', 'finalizada': 'b-green' } as Record<string, string>)[e] || 'b-grey';

  const stLabel = (e: string) =>
    ({ 'recibida': 'Recibida', 'en_analisis': 'En análisis', 'asignada': 'Asignada', 'en_tramite': 'En trámite', 'finalizada': 'Finalizada' } as Record<string, string>)[e] || e;

  const urgColor = (u: string) =>
    ({ 'alta': 'var(--red)', 'media': 'var(--gold)', 'baja': '#9AA4B2' } as Record<string, string>)[u] || '#9AA4B2';

  const urgLabel = (u: string) =>
    ({ 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja' } as Record<string, string>)[u] || u;

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const start = (page - 1) * PAGE;

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
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="sel" value={fDep} onChange={(e) => { setFDep(e.target.value); setPage(1); }}>
            <option value="">Todos los departamentos</option>
          </select>
          <select className="sel" value={fTipo} onChange={(e) => { setFTipo(e.target.value); setPage(1); }}>
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className="sel" value={fUrg} onChange={(e) => { setFUrg(e.target.value); setPage(1); }}>
            <option value="">Toda urgencia</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
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
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 44, color: 'var(--ink-3)' }}>Cargando solicitudes...</td></tr>
              ) : rows.length > 0 ? rows.map((r: any) => (
                <tr key={r.id} onClick={() => onNavigate('det')} style={{ cursor: 'pointer' }}>
                  <td className="rad">{r.case_number}</td>
                  <td><b style={{ fontWeight: 600 }}>{r.citizen_name}</b><div className="tiny muted">{r.citizen_doc}</div></td>
                  <td><span className="badge b-grey">{r.complaint_type}</span></td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.subject_text || r.theme_name || '—'}</td>
                  <td>{r.citizen_dept || '—'}<div className="tiny muted">{r.citizen_muni || ''}</div></td>
                  <td><span className={`badge ${stBadge(r.status)}`}><span className="dot" />{stLabel(r.status)}</span></td>
                  <td><span className="urg"><i style={{ background: urgColor(r.urgency) }} />{urgLabel(r.urgency)}</span></td>
                  <td className="num">{r.created_at ? new Date(r.created_at).toLocaleDateString('es-CO') : '—'}</td>
                  <td>{r.assigned_name || 'Sin asignar'}</td>
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
          <span>{total > 0 ? `${start + 1}–${Math.min(start + PAGE, total)}` : '0'} de {total} solicitudes</span>
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
