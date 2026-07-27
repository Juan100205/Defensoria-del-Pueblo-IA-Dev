import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../icons/Icons';
import { AGENTS } from '../../data/constants';
import type { Scene } from '../../data/constants';

interface ProcessingSceneProps {
  onNavigate: (scene: Scene) => void;
  data: Record<string, string>;
}

export function ProcessingScene({ onNavigate, data }: ProcessingSceneProps) {
  type AgentState = 'idle' | 'running' | 'done';
  const [agentStates, setAgentStates] = useState<AgentState[]>(new Array(AGENTS.length).fill('idle') as AgentState[]);
  const [doneCount, setDoneCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [irisOn, setIrisOn] = useState(false);
  const [visionOn, setVisionOn] = useState(false);

  const runAgents = useCallback(() => {
    setAgentStates(new Array(AGENTS.length).fill('idle'));
    setDoneCount(0);
    setShowResult(false);
    setIrisOn(false);
    setVisionOn(false);

    AGENTS.forEach((_, i) => {
      setTimeout(() => {
        setAgentStates((prev) => {
          const next = [...prev];
          next[i] = 'running';
          return next;
        });
        if (i === 0) setIrisOn(true);
        if (i === 5) setVisionOn(true);

        setTimeout(() => {
          setAgentStates((prev) => {
            const next = [...prev];
            next[i] = 'done';
            return next;
          });
          setDoneCount((prev) => {
            const newCount = prev + 1;
            if (newCount === AGENTS.length) {
              setTimeout(() => setShowResult(true), 400);
            }
            return newCount;
          });
        }, 820);
      }, 420 + i * 520);
    });
  }, []);

  useEffect(() => {
    runAgents();
  }, [runAgents]);

  return (
    <section className="scene on" id="sc-proc">
      <div className="proc">
        <div className="proc-in">
          <div className="row between gap16" style={{ flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>Dentro de la Defensoría</div>
              <h2 style={{ marginTop: 12 }}>
                La solicitud se organiza sola<br />antes de llegar al funcionario
              </h2>
              <p className="lead">
                Mientras el ciudadano recibe su constancia, el sistema lee el caso, lo clasifica,
                detecta la urgencia y prepara un resumen. El funcionario abre el expediente ya ordenado.
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('mail')}
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,.25)', color: '#C3D0E8' }}
            >
              <Icon name="back" size={15} /> Paso anterior
            </button>
          </div>

          <div className="pipe">
            <div>
              <div className="doc-card">
                <div className="hd">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--navy-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
                    <Icon name="doc" size={17} />
                  </div>
                  <div>
                    <b style={{ fontSize: 13.5 }}>{data.radicado || 'DP-2026-014782'}</b>
                    <div className="tiny muted">Entrada por chatbot</div>
                  </div>
                </div>
                <div className="scan">
                  <div className="doc-line" style={{ width: '88%' }} />
                  <div className="doc-line" style={{ width: '96%' }} />
                  <div className="doc-line" style={{ width: '72%' }} />
                  <div className="doc-line" style={{ width: '91%' }} />
                  <div className="doc-line" style={{ width: '60%' }} />
                  <div className="doc-line" style={{ width: '84%' }} />
                </div>
                <div className="row between mt16" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  <span>2 archivos adjuntos</span>
                  <span>{data.ciudad || '—'}</span>
                </div>
              </div>

              <div className="models">
                <div className={`model ${irisOn ? 'on' : ''}`} style={{ gridColumn: '1/-1' }}>
                  <div className="mk" style={{ color: 'var(--gold)' }}><Icon name="spark" size={21} /></div>
                  <div>
                    <b>Iris</b>
                    <small>Comprende el relato del ciudadano: identifica hechos, fechas, entidades y derechos posiblemente vulnerados.</small>
                  </div>
                </div>
                <div className={`model ${visionOn ? 'on' : ''}`} style={{ gridColumn: '1/-1' }}>
                  <div className="mk" style={{ color: 'var(--gold)' }}><Icon name="eye" size={21} /></div>
                  <div>
                    <b>Vision</b>
                    <small>Lee los documentos e imágenes adjuntas y verifica que sean legibles y correspondan al caso.</small>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="eyebrow" style={{ color: '#8FA6D4' }}>Agentes en ejecución</div>
                <div className="small" style={{ color: '#8FA6D4' }}>
                  {doneCount} de {AGENTS.length} completados
                </div>
              </div>

              <div className="agents">
                {AGENTS.map((a, i) => (
                  <div
                    key={i}
                    className={`agent ${agentStates[i] === 'running' ? 'run' : ''} ${agentStates[i] === 'done' ? 'ok' : ''}`}
                  >
                    <div className="ic">
                      <Icon name={a.i} size={16} style={{ color: '#C3D0E8' }} />
                    </div>
                    <b>{a.n}</b>
                    <small>{a.d}</small>
                    <div className="st">
                      {agentStates[i] === 'idle' && 'En espera'}
                      {agentStates[i] === 'running' && 'Procesando'}
                      {agentStates[i] === 'done' && 'Completado'}
                    </div>
                    <div className="bar" />
                  </div>
                ))}
              </div>

              {showResult && (
                <div className="result" style={{ marginTop: 16 }}>
                  <div className="row between gap16" style={{ flexWrap: 'wrap' }}>
                    <div className="row gap8">
                      <Icon name="checkc" size={20} style={{ color: 'var(--green)' }} />
                      <b style={{ fontSize: 16 }}>Expediente listo para el funcionario</b>
                    </div>
                    <span className="badge b-green"><span className="dot" />Procesado en 4,2 segundos</span>
                  </div>
                  <div className="kv" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
                    <div><small style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>Clasificación</small><span className="badge b-navy">Queja · Salud</span></div>
                    <div><small style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>Urgencia</small><span className="badge b-red"><span className="dot" />Alta</span></div>
                    <div><small style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>Dependencia</small><b style={{ fontSize: 13.5 }}>Delegada para la Salud</b></div>
                    <div><small style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>Duplicados</small><b style={{ fontSize: 13.5 }}>Ninguno</b></div>
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Resumen para el funcionario</div>
                    <p className="small" style={{ lineHeight: 1.65, color: 'var(--ink-2)' }}>
                      Ciudadana solicita intervención por demora superior a 40 días en la autorización
                      de una cirugía ordenada por especialista para una adulta mayor de 68 años. Ha
                      reclamado tres veces sin respuesta de fondo. Se identifica posible vulneración del
                      derecho a la salud y riesgo por el estado de la paciente.
                    </p>
                    <div className="tagset">
                      <span className="badge b-gold">Adulto mayor</span>
                      <span className="badge b-gold">Demora EPS</span>
                      <span className="badge b-gold">Derecho a la salud</span>
                      <span className="badge b-gold">Posible tutela</span>
                      <span className="badge b-navy">{data.ciudad || 'Medellín'}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary mt16" onClick={() => onNavigate('admin')}>
                    Abrir panel administrativo <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
