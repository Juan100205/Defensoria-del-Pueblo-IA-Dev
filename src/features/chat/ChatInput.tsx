import { useState, useCallback, useRef } from 'react';
import { Icon } from '../../icons/Icons';
import { useVoice } from '../../hooks/useVoice';
import { transcribeAudio } from '../../lib/api';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

function MicButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { isListening, transcript, isSupported, isAvailable, error, startListening, stopListening, resetTranscript } = useVoice();
  const [localError, setLocalError] = useState<string | null>(null);
  const [backendTranscribing, setBackendTranscribing] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const canUseBrowser = isSupported && isAvailable;
  const displayError = error || localError;

  const handleToggleMic = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (recording) {
      recorderRef.current?.stop();
      return;
    }

    setLocalError(null);
    resetTranscript();

    if (canUseBrowser) {
      startListening();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          setRecording(false);
          if (chunks.length === 0) return;
          const blob = new Blob(chunks, { type: mimeType });
          setBackendTranscribing(true);
          try {
            const result = await transcribeAudio(blob);
            if (result.text) onTranscript(result.text);
            else setLocalError('No se pudo transcribir el audio.');
          } catch {
            setLocalError('Error al transcribir. Verifica tu conexion.');
          }
          setBackendTranscribing(false);
        };

        recorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
        setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 12000);
      } catch (e: any) {
        if (e.name === 'NotAllowedError') {
          setLocalError('Permiso de microfono denegado. Habilita el permiso en tu navegador.');
        } else {
          setLocalError('No se pudo acceder al microfono.');
        }
      }
    }
  }, [isListening, canUseBrowser, recording, startListening, stopListening, resetTranscript, onTranscript]);

  const handleSendVoice = useCallback(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  if (!isSupported && !navigator.mediaDevices) return null;

  const showBackendOption = !canUseBrowser;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleToggleMic}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: (isListening || recording) ? '2px solid var(--red)' : '2px solid var(--line-2)',
            background: (isListening || recording) ? 'var(--red-050)' : 'var(--navy-050)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            animation: (isListening || recording) ? 'pulse 1.5s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }}
          title={(isListening || recording) ? 'Detener grabacion' : 'Hablar'}
        >
          <Icon name={(isListening || recording) ? 'stop' : 'mic'} size={20} style={{ color: (isListening || recording) ? 'var(--red)' : 'var(--navy)' }} />
        </button>

        {transcript && (
          <>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic', minWidth: 0 }}>
              "{transcript}"
            </span>
            <button className="btn btn-primary btn-sm" onClick={handleSendVoice} style={{ flexShrink: 0 }}>
              Enviar
            </button>
          </>
        )}

        {backendTranscribing && (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Transcribiendo en servidor...</span>
        )}

        {!isListening && !recording && !transcript && !backendTranscribing && (
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {showBackendOption ? 'Grabacion por servidor' : 'Click para hablar'}
          </span>
        )}
      </div>

      {(isListening || recording) && (
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: 3,
              height: 12,
              background: 'var(--red)',
              borderRadius: 2,
              animation: `soundbar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
            }} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--red)', marginLeft: 4 }}>
            Grabando... (max 12s)
          </span>
        </div>
      )}

      {displayError && (
        <div style={{
          fontSize: 11,
          color: 'var(--red)',
          textAlign: 'center',
          background: 'var(--red-050)',
          padding: '4px 10px',
          borderRadius: 6,
          maxWidth: 340,
        }}>
          {displayError}
          {showBackendOption && (
            <span style={{ display: 'block', marginTop: 2, color: 'var(--ink-3)' }}>
              Use Chrome/Edge con HTTPS o la transcripcion del servidor.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  return (
    <div>
      <MicButton onTranscript={(text) => onSend(text)} />
      <div className="composer">
        <input
          className="field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escriba su mensaje..."
          disabled={disabled}
          autoFocus
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
