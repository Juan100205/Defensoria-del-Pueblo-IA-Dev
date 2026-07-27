import { useRef, useEffect } from 'react';
import { Icon } from '../../icons/Icons';

interface ChatBodyProps {
  messages: { who: 'bot' | 'me'; html: string }[];
  typing: boolean;
}

export function ChatBody({ messages, typing }: ChatBodyProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="chat-body" role="log" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={`msg ${m.who}`} style={{ animation: 'fadeUp .35s var(--ease) both' }}>
          {m.who === 'bot' && (
            <span className="av">
              <Icon name="bot" size={16} style={{ color: '#fff' }} />
            </span>
          )}
          <div className="bub" dangerouslySetInnerHTML={{ __html: m.html }} />
        </div>
      ))}
      {typing && (
        <div className="msg bot">
          <span className="av">
            <Icon name="bot" size={16} style={{ color: '#fff' }} />
          </span>
          <div className="bub" style={{ padding: 0 }}>
            <div className="typing">
              <i /><i /><i />
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
