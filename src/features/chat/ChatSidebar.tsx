interface ChatSidebarProps {
  data: Record<string, string>;
  branch: string | null;
  progressPct: number;
}

const BRANCH_LABELS: Record<string, string> = {
  peticion: 'Peticion / Solicitud',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
  denuncia_ddhh: 'Denuncia DDHH',
  tutela: 'Tutela',
};

const FIELD_LABELS: Record<string, string> = {
  Nombre: 'Nombre completo',
  Documento: 'Documento',
  Correo: 'Correo electronico',
  Telefono: 'Telefono',
  Ciudad: 'Ubicacion',
  Descripcion: 'Descripcion',
};

export function ChatSidebar({ data, branch, progressPct }: ChatSidebarProps) {
  const fields = Object.entries(FIELD_LABELS);

  return (
    <aside className="chat-side">
      <div className="side-card">
        <h4 className="side-title">Datos del ciudadano</h4>
        <p className="tiny muted" style={{ marginBottom: 10 }}>
          {branch
            ? `Tipo: ${BRANCH_LABELS[branch] || branch}`
            : 'La IA detectara el tipo de solicitud...'}
        </p>
        <ul className="side-list">
          {fields.map(([key, label]) => {
            const value = data[key];
            return (
              <li key={key} className="side-item">
                <span className="side-label">{label}</span>
                <span className={`side-val ${value ? '' : 'pending'}`}>
                  {value || 'Pendiente'}
                </span>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="tiny muted">Progreso</span>
            <span className="tiny bold">{progressPct}%</span>
          </div>
          <div style={{
            height: 6,
            background: 'var(--line)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--navy)',
              borderRadius: 3,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      <div className="side-card" style={{ marginTop: 12 }}>
        <h4 className="side-title">Necesita ayuda?</h4>
        <p className="tiny muted" style={{ marginBottom: 6 }}>
          Linea nacional: <b>018000 914814</b>
        </p>
        <p className="tiny muted">
          Horario: lunes a viernes 8:00 a.m. - 5:00 p.m.
        </p>
      </div>
    </aside>
  );
}
