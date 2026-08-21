import { Icon } from '../../icons/Icons';

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

const FIELDS: { key: string; label: string; icon: string }[] = [
  { key: 'Nombre', label: 'Nombre completo', icon: 'users' },
  { key: 'Documento', label: 'Documento', icon: 'doc' },
  { key: 'Correo', label: 'Correo electronico', icon: 'mail' },
  { key: 'Telefono', label: 'Telefono', icon: 'chat' },
  { key: 'Ciudad', label: 'Ubicacion', icon: 'pin' },
  { key: 'Descripcion', label: 'Descripcion', icon: 'doc' },
];

export function ChatSidebar({ data, branch, progressPct }: ChatSidebarProps) {
  const filledCount = FIELDS.filter(f => data[f.key]).length;

  return (
    <aside className="chat-side">
      <div className="side-card">
        <div className="side-hd">
          <div className="side-hd-icon">
            <Icon name="users" size={18} />
          </div>
          <div>
            <h4 className="side-title">Datos del ciudadano</h4>
            <p className="side-sub">
              {branch
                ? `Tipo: ${BRANCH_LABELS[branch] || branch}`
                : 'La IA detectara el tipo de solicitud...'}
            </p>
          </div>
        </div>

        <div className="side-fields">
          {FIELDS.map((f) => {
            const value = data[f.key];
            const filled = !!value;
            return (
              <div key={f.key} className={`side-field ${filled ? 'filled' : ''}`}>
                <div className="side-field-left">
                  <span className={`side-field-icon ${filled ? 'filled' : ''}`}>
                    <Icon name={f.icon as any} size={14} />
                  </span>
                  <span className="side-field-label">{f.label}</span>
                </div>
                <span className={`side-field-value ${filled ? 'filled' : 'pending'}`}>
                  {filled ? (
                    <>
                      <Icon name="check" size={13} />
                      <span>{value}</span>
                    </>
                  ) : (
                    <span className="side-field-dots">
                      <span /><span /><span />
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="side-progress">
          <div className="side-progress-top">
            <span className="tiny muted">Progreso</span>
            <span className="tiny bold">{filledCount}/{FIELDS.length} campos</span>
          </div>
          <div className="side-progress-bar">
            <div
              className="side-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="side-card side-help">
        <div className="side-help-hd">
          <Icon name="chat" size={16} />
          <span>Necesita ayuda?</span>
        </div>
        <div className="side-help-row">
          <span className="tiny muted">Linea nacional</span>
          <b>018000 914814</b>
        </div>
        <div className="side-help-row">
          <span className="tiny muted">Horario</span>
          <span className="tiny">Lun - Vie 8:00 a.m. - 5:00 p.m.</span>
        </div>
      </div>
    </aside>
  );
}
