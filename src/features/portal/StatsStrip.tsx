export function StatsStrip() {
  const stats = [
    { value: '12.847', label: 'Solicitudes recibidas en 2026' },
    { value: '4,2 días', label: 'Tiempo promedio de primera respuesta' },
    { value: '96%', label: 'Atendidas dentro del término legal' },
    { value: '32', label: 'Regionales conectadas' },
  ];

  return (
    <div className="strip-facts">
      <div className="in stagger">
        {stats.map((s) => (
          <div key={s.label} className="fact">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
