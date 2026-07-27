import { ChatHeader } from '../../components/layout/ChatHeader';
import { FlagLine } from '../../components/ui/FlagLine';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Emblem } from '../../icons/Icons';
import { ChatBody } from './ChatBody';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { useChatEngine } from './chatEngine';
import type { Scene } from '../../data/constants';

interface ChatSceneProps {
  onNavigate: (scene: Scene) => void;
  onFinished: (data: Record<string, string>) => void;
}

export function ChatScene({ onNavigate }: ChatSceneProps) {
  const engine = useChatEngine();

  const handleDemoFill = () => {
    engine.setAutoMode(true);
    // Auto-answer sequentially
    const answers = [
      'Luisa Fernanda Ospina Cárdenas',
      'CC 1.032.487.115',
      'luisa.ospina@correo.com',
      '318 445 0912',
      'Medellín, Antioquia',
      'Queja',
      'El 3 de junio pedí a mi EPS la autorización de la cirugía que ordenó el especialista para mi mamá, que tiene 68 años. Han pasado más de 40 días, he ido tres veces a la sede y solo me dicen que el trámite sigue en estudio. Ella tiene dolor permanente y ya no puede trabajar. Necesito que la Defensoría intervenga.',
      '2 archivos adjuntos',
      'Autorizo el tratamiento de mis datos',
    ];
    let i = 0;
    const fill = () => {
      if (i < answers.length) {
        engine.answer(answers[i]);
        i++;
        setTimeout(fill, 800);
      }
    };
    fill();
  };

  return (
    <section className="scene chat-scene on" id="sc-chat">
      <ChatHeader onNavigate={onNavigate} />
      <FlagLine />

      <div className="chat-wrap">
        <div className="chat-shell">
          <div className="chat-panel">
            <div className="chat-hd">
              <div className="bot-av">
                <Emblem size={21} />
              </div>
              <div className="nm">
                <b>Asistente de radicación</b>
                <small>
                  <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />{' '}
                  En línea · responde al instante
                </small>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={handleDemoFill}
              >
                Rellenar con datos de ejemplo
              </button>
            </div>

            <ProgressBar step={engine.progressStep} pct={engine.progressPct} />

            <ChatBody messages={engine.messages} typing={engine.typing} />

            <div className="chat-foot">
              {engine.currentStep && !engine.busy && engine.stepIndex < 9 && (
                <ChatInput step={engine.currentStep} onAnswer={engine.answer} />
              )}
            </div>
          </div>

          <ChatSidebar
            data={engine.data}
            stepIndex={engine.stepIndex}
            totalSteps={9}
          />
        </div>
      </div>
    </section>
  );
}
