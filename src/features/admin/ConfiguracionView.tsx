export function ConfiguracionView() {
  const rows = (arr: [string, string, number][]) =>
    arr.map(([t, s, on]) => (
      <div key={t} className="cfg-row">
        <div><b>{t}</b><small>{s}</small></div>
        <span className={`switch ${on ? 'on' : ''}`} />
      </div>
    ));

  return (
    <div className="vpane on" id="v-cfg">
      <div className="g2">
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Asistente de radicación</h3>
          <p className="small muted" style={{ marginTop: 8 }}>Ajustes del chatbot que atiende a los ciudadanos.</p>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['Saludo con nombre del ciudadano', 'El asistente usa el nombre desde el segundo paso', 1],
              ['Permitir corregir respuestas anteriores', 'El ciudadano escribe "corregir" para devolverse', 1],
              ['Adjuntos obligatorios en denuncias DDHH', 'Exige al menos un soporte antes de radicar', 0],
              ['Encuesta de satisfacción al finalizar', 'Una pregunta después de mostrar el radicado', 1],
            ])}
          </div>
        </div>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Reglas de priorización</h3>
          <p className="small muted" style={{ marginTop: 8 }}>Condiciones que marcan un caso como urgente de forma automática.</p>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['Menores de edad involucrados', 'Marca urgencia alta automáticamente', 1],
              ['Adulto mayor con caso en salud', 'Marca urgencia alta automáticamente', 1],
              ['Palabras de riesgo vital en el relato', 'Notifica al coordinador de turno', 1],
              ['Municipio con alerta temprana vigente', 'Prioriza y asigna a la regional', 1],
              ['Reincidencia del mismo ciudadano', 'Agrupa el caso con el expediente anterior', 0],
            ])}
          </div>
        </div>
      </div>
      <div className="g2" style={{ marginTop: 16 }}>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Términos y notificaciones</h3>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['Recordatorio a 3 días del vencimiento', 'Correo al funcionario responsable', 1],
              ['Escalamiento automático al vencer', 'Notifica a la coordinación de la dependencia', 1],
              ['Notificar al ciudadano en cada cambio de estado', 'Correo electrónico y SMS', 1],
              ['Resumen diario para coordinadores', 'Se envía a las 18:00', 0],
            ])}
          </div>
        </div>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Identidad y accesibilidad</h3>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['Modo de alto contraste', 'Cumple WCAG 2.1 nivel AA', 0],
              ['Aumentar tamaño de fuente base', 'Para funcionarios con baja visión', 0],
              ['Lectura fácil en el chatbot', 'Frases cortas y vocabulario simplificado', 1],
              ['Marca institucional en exportaciones', 'Logo y pie de página oficiales', 1],
            ])}
          </div>
        </div>
      </div>
    </div>
  );
}
