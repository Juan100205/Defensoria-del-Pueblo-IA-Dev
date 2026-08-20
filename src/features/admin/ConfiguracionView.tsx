import { useState, useEffect, useCallback } from 'react';
import { getSystemSettings, updateSystemSetting } from '../../lib/api';

export function ConfiguracionView() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemSettings()
      .then((data) => {
        const map: Record<string, any> = {};
        data?.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = useCallback(async (key: string) => {
    const newVal = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newVal }));
    try {
      await updateSystemSetting(key, newVal);
    } catch (err) {
      setSettings((prev) => ({ ...prev, [key]: !newVal }));
      console.error('Error updating setting:', err);
    }
  }, [settings]);

  const rows = (items: [string, string, string][]) =>
    items.map(([key, title, desc]) => (
      <div key={key} className="cfg-row">
        <div><b>{title}</b><small>{desc}</small></div>
        <span
          className={`switch ${settings[key] ? 'on' : ''}`}
          onClick={() => toggle(key)}
          style={{ cursor: 'pointer' }}
        />
      </div>
    ));

  if (loading) {
    return (
      <div className="vpane on" id="v-cfg">
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>
          Cargando configuración...
        </div>
      </div>
    );
  }

  return (
    <div className="vpane on" id="v-cfg">
      <div className="g2">
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Asistente de radicación</h3>
          <p className="small muted" style={{ marginTop: 8 }}>Ajustes del chatbot que atiende a los ciudadanos.</p>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['chatbot_greet_by_name', 'Saludo con nombre del ciudadano', 'El asistente usa el nombre desde el segundo paso'],
              ['chatbot_allow_correction', 'Permitir corregir respuestas anteriores', 'El ciudadano escribe "corregir" para devolverse'],
              ['chatbot_require_attachments', 'Adjuntos obligatorios en denuncias DDHH', 'Exige al menos un soporte antes de radicar'],
              ['chatbot_satisfaction_survey', 'Encuesta de satisfacción al finalizar', 'Una pregunta después de mostrar el radicado'],
            ])}
          </div>
        </div>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Reglas de priorización</h3>
          <p className="small muted" style={{ marginTop: 8 }}>Condiciones que marcan un caso como urgente de forma automática.</p>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['rule_minor_involved', 'Menores de edad involucrados', 'Marca urgencia alta automáticamente'],
              ['rule_elderly_health', 'Adulto mayor con caso en salud', 'Marca urgencia alta automáticamente'],
              ['rule_vital_risk_words', 'Palabras de riesgo vital en el relato', 'Notifica al coordinador de turno'],
              ['rule_early_alert_municipality', 'Municipio con alerta temprana vigente', 'Prioriza y asigna a la regional'],
              ['rule_reincidence', 'Reincidencia del mismo ciudadano', 'Agrupa el caso con el expediente anterior'],
            ])}
          </div>
        </div>
      </div>
      <div className="g2" style={{ marginTop: 16 }}>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Términos y notificaciones</h3>
          <div style={{ marginTop: 16 }}>
            {rows([
              ['notify_deadline_reminder', 'Recordatorio a 3 días del vencimiento', 'Correo al funcionario responsable'],
              ['notify_auto_escalation', 'Escalamiento automático al vencer', 'Notifica a la coordinación de la dependencia'],
              ['notify_citizen_status_change', 'Notificar al ciudadano en cada cambio de estado', 'Correo electrónico y SMS'],
              ['notify_daily_summary', 'Resumen diario para coordinadores', 'Se envía a las 18:00'],
            ])}
          </div>
        </div>
        <div className="card card-p">
          <h3 style={{ fontSize: 16 }}>Configuración de IA</h3>
          <div style={{ marginTop: 16 }}>
            {[
              ['ai_model_classification', 'Modelo de clasificación', settings.ai_model_classification || 'gpt-4o'],
              ['ai_model_summarization', 'Modelo de resumen', settings.ai_model_summarization || 'gpt-4o'],
              ['ai_model_legal_analysis', 'Modelo de análisis jurídico', settings.ai_model_legal_analysis || 'gpt-4o'],
              ['ai_model_vision', 'Modelo de visión (documentos)', settings.ai_model_vision || 'gpt-4o'],
            ].map(([key, label, value]) => (
              <div key={key} className="cfg-row">
                <div><b>{label}</b><small>Modelo configurado para esta tarea</small></div>
                <span className="badge b-navy">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
