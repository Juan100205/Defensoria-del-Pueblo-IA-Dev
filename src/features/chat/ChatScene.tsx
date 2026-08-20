import { useCallback } from 'react';
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
  onFinished: (data: Record<string, string>, caseId?: string, radicado?: string) => void;
}

export function ChatScene({ onNavigate, onFinished }: ChatSceneProps) {
  const handleCaseCreated = useCallback((caseId: string, caseNumber: string) => {
    onFinished({}, caseId, caseNumber);
  }, [onFinished]);

  const engine = useChatEngine(handleCaseCreated);

  const progressLabel = engine.branch
    ? `Radicando solicitud (${engine.branch})`
    : 'Recopilando informacion';

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
                <b>Asistente de radicacion</b>
                <small>
                  <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />{' '}
                  En linea - responde al instante
                </small>
              </div>
            </div>

            <ProgressBar step={progressLabel} pct={engine.progressPct} />

            <ChatBody messages={engine.messages} typing={engine.typing} />

            <div className="chat-foot">
              {!engine.caseCreated && (
                <ChatInput
                  onSend={engine.send}
                  disabled={engine.busy}
                />
              )}
            </div>
          </div>

          <ChatSidebar
            data={engine.userFields}
            branch={engine.branch}
            progressPct={engine.progressPct}
          />
        </div>
      </div>
    </section>
  );
}
