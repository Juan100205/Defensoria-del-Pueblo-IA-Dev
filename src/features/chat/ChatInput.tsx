import { useState } from 'react';
import { Icon } from '../../icons/Icons';
import type { ChatStep } from '../../data/mockData';
import { TIPOS } from '../../data/constants';

interface ChatInputProps {
  step: ChatStep;
  onAnswer: (val: string) => void;
}

export function ChatInput({ step, onAnswer }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [docType, setDocType] = useState('C.C.');
  const [files, setFiles] = useState<string[]>([]);
  const [consented, setConsented] = useState(false);

  if (step.ui === 'text') {
    return (
      <div className="composer">
        <input
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onAnswer(value.trim());
          }}
          placeholder={step.ph || ''}
          autoFocus
        />
        <button className="btn btn-primary" onClick={() => value.trim() && onAnswer(value.trim())}>
          Enviar
        </button>
      </div>
    );
  }

  if (step.ui === 'doc') {
    return (
      <>
        <div className="chips">
          {['C.C.', 'C.E.', 'T.I.', 'Pasaporte', 'NIT'].map((d) => (
            <button
              key={d}
              className={`chip ${docType === d ? 'sel' : ''}`}
              onClick={() => setDocType(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="composer">
          <input
            className="field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onAnswer(`${docType} ${value.trim()}`);
            }}
            placeholder="Número de documento"
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={() => value.trim() && onAnswer(`${docType} ${value.trim()}`)}
          >
            Enviar
          </button>
        </div>
      </>
    );
  }

  if (step.ui === 'city') {
    const cities = ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Cúcuta', 'Quibdó'];
    return (
      <>
        <div className="chips">
          {cities.map((c) => (
            <button key={c} className="chip" onClick={() => onAnswer(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="composer">
          <input
            className="field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onAnswer(value.trim());
            }}
            placeholder="O escriba su municipio"
          />
          <button className="btn btn-primary" onClick={() => value.trim() && onAnswer(value.trim())}>
            Enviar
          </button>
        </div>
      </>
    );
  }

  if (step.ui === 'type') {
    const help: Record<string, string> = {
      'Petición': 'Solicito información o una actuación',
      'Queja': 'Un servidor o entidad actuó mal',
      'Reclamo': 'No me prestaron un servicio debido',
      'Sugerencia': 'Propongo una mejora',
      'Denuncia DDHH': 'Vulneración de derechos humanos',
      'Tutela': 'Necesito acompañamiento para una tutela',
    };
    return (
      <>
        <div className="chips">
          {TIPOS.map((t) => (
            <button key={t} className="chip" title={help[t]} onClick={() => onAnswer(t)}>
              {t}
            </button>
          ))}
        </div>
        <p className="tiny muted">Pase el cursor sobre cada opción para ver un ejemplo.</p>
      </>
    );
  }

  if (step.ui === 'area') {
    return (
      <>
        <textarea
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escriba aquí lo que ocurrió…"
          autoFocus
        />
        <div className="row between mt8">
          <span className="tiny muted">Mínimo 20 caracteres</span>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (value.trim().length < 20) {
                return;
              }
              onAnswer(value.trim());
            }}
          >
            Enviar descripción
          </button>
        </div>
      </>
    );
  }

  if (step.ui === 'files') {
    const names = ['orden_medica_cirugia.pdf', 'respuesta_eps_junio.jpg', 'historia_clinica.pdf'];
    return (
      <>
        <div>
          {files.map((f, i) => (
            <div key={i} className="file-item" style={{ animation: 'pop .3s var(--ease)' }}>
              <Icon name="doc" size={16} style={{ color: 'var(--navy)' }} />
              <span>{f}</span>
              <span className="tiny muted" style={{ marginLeft: 'auto' }}>
                {Math.floor(Math.random() * 800 + 180)} KB
              </span>
              <Icon name="checkc" size={15} style={{ color: 'var(--green)' }} />
            </div>
          ))}
        </div>
        <div
          className="drop"
          onClick={() => setFiles((prev) => [...prev, names[prev.length % 3]])}
        >
          <Icon name="clip" size={22} style={{ color: 'var(--ink-3)' }} />
          <p className="small muted" style={{ marginTop: 8 }}>
            Arrastre archivos aquí o <b style={{ color: 'var(--navy)' }}>selecciónelos desde su equipo</b>
          </p>
          <p className="tiny muted" style={{ marginTop: 4 }}>
            PDF, JPG o PNG · hasta 10 MB por archivo
          </p>
        </div>
        <div className="row gap8">
          <button className="btn btn-ghost" onClick={() => onAnswer('Sin archivos adjuntos')}>
            Continuar sin adjuntar
          </button>
          <button
            className="btn btn-primary"
            disabled={files.length === 0}
            onClick={() => onAnswer(`${files.length} archivo${files.length > 1 ? 's' : ''} adjunto${files.length > 1 ? 's' : ''}`)}
          >
            Continuar con {files.length > 0 ? `${files.length} archivo${files.length > 1 ? 's' : ''}` : 'los archivos'}
          </button>
        </div>
      </>
    );
  }

  if (step.ui === 'consent') {
    return (
      <>
        <label className="consent">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
          />
          <span>
            Autorizo a la Defensoría del Pueblo a recolectar, almacenar y usar mis datos personales
            con la única finalidad de tramitar esta solicitud, conforme a la Ley 1581 de 2012. Conozco
            que puedo consultarlos, actualizarlos o solicitar su supresión.
          </span>
        </label>
        <div className="row gap8">
          <button
            className="btn btn-primary"
            disabled={!consented}
            onClick={() => onAnswer('Autorizo el tratamiento de mis datos')}
          >
            Autorizo y radico mi solicitud
          </button>
          <button className="btn btn-quiet">Leer política completa</button>
        </div>
      </>
    );
  }

  return null;
}
