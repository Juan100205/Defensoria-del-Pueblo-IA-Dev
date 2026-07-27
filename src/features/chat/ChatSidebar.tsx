import { Icon } from '../../icons/Icons';

interface ChatSidebarProps {
  data: Record<string, string>;
  stepIndex: number;
  totalSteps: number;
}

export function ChatSidebar({ data }: ChatSidebarProps) {
  const rows: [string, string, string][] = [
    ['nombre', 'Nombre', data.nombre],
    ['documento', 'Documento', data.documento],
    ['correo', 'Correo', data.correo],
    ['telefono', 'Teléfono', data.telefono],
    ['ciudad', 'Ciudad', data.ciudad],
    ['tipo', 'Tipo', data.tipo],
    ['descripcion', 'Descripción', data.descripcion],
    ['archivos', 'Archivos', data.archivos],
    ['consentimiento', 'Autorización', data.consentimiento],
  ];

  return (
    <aside className="chat-side">
      <div className="side-card">
        <h4>Su solicitud</h4>
        {rows.map(([k, label, val]) => (
          <div key={k} className={`summ-row ${val ? '' : 'pend'}`}>
            <span>{label}</span>
            <b>
              {k === 'descripcion' && val
                ? val.slice(0, 46) + (val.length > 46 ? '…' : '')
                : val || 'Pendiente'}
            </b>
          </div>
        ))}
      </div>
      <div className="side-card">
        <h4>Cómo lo ayudamos</h4>
        <ul className="help-list">
          <li>Solo una pregunta a la vez, en lenguaje sencillo.</li>
          <li>Puede escribir con sus propias palabras: nosotros organizamos la información.</li>
          <li>
            Si se equivoca, escriba <b>corregir</b> y volvemos al paso anterior.
          </li>
          <li>Sus datos se usan únicamente para atender la solicitud.</li>
        </ul>
      </div>
      <div className="side-card" style={{ background: 'var(--navy-050)', borderColor: 'var(--navy-100)' }}>
        <div className="row gap8" style={{ alignItems: 'flex-start' }}>
          <Icon name="shield" size={18} style={{ color: 'var(--navy)', flex: '0 0 auto', marginTop: 1 }} />
          <p className="small" style={{ color: 'var(--navy-700)', lineHeight: 1.55 }}>
            Si su vida o integridad están en riesgo, llame al <b>018000 914814</b>. Marcaremos su caso como urgente.
          </p>
        </div>
      </div>
    </aside>
  );
}
