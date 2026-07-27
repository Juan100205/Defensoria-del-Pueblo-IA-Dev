import { Icon } from '../../icons/Icons';

const channels = [
  { icon: 'pin' as const, title: 'Presencial', desc: '32 regionales y 6 sedes especializadas en todo el país. Consulte horarios y direcciones.' },
  { icon: 'mail' as const, title: 'Correo institucional', desc: 'Escriba a atencionciudadano@defensoria.gov.co y su mensaje entra al mismo sistema.' },
  { icon: 'users' as const, title: 'Acompañamiento comunitario', desc: 'Jornadas móviles en territorios con difícil acceso a conectividad.' },
];

export function ChannelsSection() {
  return (
    <section className="chan">
      <div className="eyebrow">Otros canales</div>
      <h2 style={{ fontSize: 26, marginTop: 10 }}>Si prefiere otra vía, también lo atendemos</h2>
      <div className="chan-grid">
        {channels.map((ch) => (
          <div key={ch.title} className="chan-card">
            <div className="ic" style={{ color: 'var(--navy)' }}>
              <Icon name={ch.icon} size={20} />
            </div>
            <h4>{ch.title}</h4>
            <p>{ch.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
