import { Icon } from '../../icons/Icons';
import { FUNCIONARIOS } from '../../data/constants';

export function DetalleView() {
  const r = {
    rad: 'DP-2026-014782',
    nombre: 'Luisa Fernanda Ospina Cárdenas',
    doc: 'CC 1.032.487.115',
    tipo: 'Queja',
    tema: 'Salud',
    dep: 'Antioquia',
    muni: 'Medellín',
    asunto: 'Negación de autorización para cirugía',
    estado: 'En análisis',
    urg: 'Alta',
    fecha: '18/07/2026',
    hora: '14:23',
    tel: '318 445 0912',
    resp: 'Marcela Ríos Vanegas',
    dias: 12,
  };

  return (
    <div className="vpane on" id="v-det">
      <button className="btn btn-quiet btn-sm" style={{ marginBottom: 12 }}>
        <Icon name="back" size={15} /> Volver a solicitudes
      </button>
      <div className="detail">
        <div className="card">
          <div className="dt-hd">
            <div className="row between gap16" style={{ flexWrap: 'wrap' }}>
              <div>
                <div className="row gap8">
                  <span className="rad num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{r.rad}</span>
                  <span className="badge b-red"><span className="dot" />urgencia alta</span>
                  <span className="badge b-navy">{r.tipo}</span>
                </div>
                <h3 style={{ marginTop: 6 }}>{r.asunto}</h3>
                <div className="small muted" style={{ marginTop: 8 }}>{r.nombre} · {r.muni}, {r.dep} · radicada el {r.fecha} a las {r.hora}</div>
              </div>
              <div className="row gap8">
                <button className="btn btn-ghost btn-sm">Reasignar</button>
                <button className="btn btn-primary btn-sm">Responder al ciudadano</button>
              </div>
            </div>
          </div>
          <div className="tabs">
            <button className="tab act">Resumen</button>
            <button className="tab">Información personal</button>
            <button className="tab">Cronología</button>
            <button className="tab">Archivos</button>
            <button className="tab">Comentarios</button>
            <button className="tab">Historial</button>
          </div>
          <div className="tabpane on" id="t-res">
            <div className="ai-box">
              <div className="hd">
                <Icon name="spark" size={17} style={{ color: '#B08A20' }} />
                <b>Resumen generado por el sistema</b>
                <span className="badge b-gold" style={{ marginLeft: 'auto' }}>Revisado por Iris</span>
              </div>
              <p>Ciudadana solicita intervención por demora superior a 40 días en la autorización de una cirugía ordenada por especialista para una adulta mayor de 68 años. Ha reclamado tres veces sin respuesta de fondo. Se identifica posible vulneración del derecho a la salud y riesgo por el estado de la paciente.</p>
              <div className="tagset">
                <span className="badge b-gold">Salud</span>
                <span className="badge b-gold">Respuesta pendiente</span>
                <span className="badge b-gold">Entidad territorial</span>
                <span className="badge b-gold">Riesgo alto</span>
              </div>
            </div>
            <div className="kvs" style={{ marginTop: 22 }}>
              {[['Tipo', r.tipo], ['Tema', r.tema], ['Competencia', 'Defensoría del Pueblo'], ['Dependencia', 'Delegada para ' + r.tema], ['Canal', 'Chatbot web'], ['Duplicados', 'No se encontraron']].map(([k, v]) => (
                <div key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Relato del ciudadano</div>
              <p className="small" style={{ lineHeight: 1.7, color: 'var(--ink-2)' }}>
                Presenté la solicitud ante la entidad el mes pasado y hasta hoy no he recibido respuesta.
                He asistido en tres oportunidades a la oficina de atención y solo me indican que el trámite
                continúa en revisión. Solicito el acompañamiento de la Defensoría del Pueblo para que se
                resuelva mi situación, ya que la demora me está causando perjuicios.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-p">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Estado del caso</div>
            <label className="lbl">Estado actual</label>
            <select className="sel" style={{ width: '100%', height: 40 }}>
              <option>En análisis</option>
              <option>Asignada</option>
              <option>En trámite</option>
              <option>Finalizada</option>
            </select>
            <label className="lbl" style={{ marginTop: 16 }}>Dependencia responsable</label>
            <select className="sel" style={{ width: '100%', height: 40 }}>
              <option>Delegada para la Salud</option>
              <option>Delegada para Víctimas</option>
              <option>Regional Antioquia</option>
            </select>
            <label className="lbl" style={{ marginTop: 16 }}>Funcionario asignado</label>
            <select className="sel" style={{ width: '100%', height: 40 }}>
              {FUNCIONARIOS.map((f) => <option key={f.n}>{f.n}</option>)}
            </select>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Guardar cambios</button>
          </div>
          <div className="card card-p" style={{ marginTop: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Sugerencias para el funcionario</div>
            {[
              'Verificar si existe tutela en curso por los mismos hechos',
              'Requerir a la entidad accionada con término de 5 días',
              'Ofrecer acompañamiento para acción de tutela si no hay respuesta',
              'Registrar el caso en el seguimiento de salud',
            ].map((s) => (
              <div key={s} className="row gap8" style={{ alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                <Icon name="spark" size={15} style={{ color: '#B08A20', flex: '0 0 auto', marginTop: 2 }} />
                <span className="small" style={{ lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div className="card card-p" style={{ marginTop: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Términos</div>
            <div className="summ-row"><span>Radicada</span><b>{r.fecha}</b></div>
            <div className="summ-row"><span>Vence</span><b>05/08/2026</b></div>
            <div className="summ-row"><span>Días restantes</span><b style={{ color: r.dias < 4 ? 'var(--red)' : 'var(--ink)' }}>{r.dias} días hábiles</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
