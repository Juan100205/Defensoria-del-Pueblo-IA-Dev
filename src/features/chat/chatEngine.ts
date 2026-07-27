import { useState, useCallback, useRef, useEffect } from 'react';
import { STEPS, SAMPLE, type ChatStep } from '../../data/mockData';

interface ChatData {
  [key: string]: string;
}

interface UseChatEngineReturn {
  stepIndex: number;
  data: ChatData;
  busy: boolean;
  progressPct: number;
  progressStep: string;
  messages: { who: 'bot' | 'me'; html: string }[];
  typing: boolean;
  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  answer: (val: string) => void;
  reset: () => void;
  autoAnswer: () => void;
  currentStep: ChatStep | null;
}

export function useChatEngine(): UseChatEngineReturn {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<ChatData>({});
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ who: 'bot' | 'me'; html: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [started, setStarted] = useState(false);
  const botQueueRef = useRef<string[]>([]);
  const processingRef = useRef(false);

  const progressPct = Math.round((stepIndex / STEPS.length) * 100);
  const currentStep = stepIndex < STEPS.length ? STEPS[stepIndex] : null;
  const progressStep = currentStep
    ? `Paso ${Math.min(stepIndex + 1, STEPS.length)} de ${STEPS.length} · ${currentStep.t}`
    : 'Radicando su solicitud';

  const processBotQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setBusy(true);

    while (botQueueRef.current.length > 0) {
      const raw = botQueueRef.current.shift()!;
      setTyping(true);
      await new Promise((r) => setTimeout(r, 620));
      setTyping(false);

      const txt = raw.replace('{first}', (data.nombre || '').split(' ')[0] || '');
      setMessages((prev) => [...prev, { who: 'bot', html: txt }]);
      await new Promise((r) => setTimeout(r, 220));
    }

    setBusy(false);
    processingRef.current = false;
  }, [data.nombre]);

  const askStep = useCallback(
    (idx: number) => {
      const s = STEPS[idx];
      if (!s) return;
      botQueueRef.current = [...s.bot];
      processBotQueue();
    },
    [processBotQueue],
  );

  useEffect(() => {
    if (started && !processingRef.current && messages.length === 0) {
      askStep(0);
    }
  }, [started, askStep, messages.length]);

  const answer = useCallback(
    (val: string) => {
      const s = STEPS[stepIndex];
      if (!s) return;

      setMessages((prev) => [...prev, { who: 'me', html: val }]);
      setData((prev) => ({ ...prev, [s.k]: val }));

      const next = stepIndex + 1;
      setStepIndex(next);

      if (next < STEPS.length) {
        setTimeout(() => askStep(next), 420);
      } else {
        setTimeout(() => {
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                who: 'bot',
                html: 'Listo. Su solicitud quedó registrada y ya tiene número de radicado.<span class="hint">Le muestro la constancia en pantalla.</span>',
              },
            ]);
          }, 1100);
        }, 300);
      }
    },
    [stepIndex, askStep],
  );

  const autoAnswer = useCallback(() => {
    const s = STEPS[stepIndex];
    if (!s) return;
    const v = SAMPLE[s.k as keyof typeof SAMPLE];
    if (v) answer(v);
  }, [stepIndex, answer]);

  const reset = useCallback(() => {
    setStepIndex(0);
    setData({});
    setMessages([]);
    setBusy(false);
    setTyping(false);
    setStarted(false);
    processingRef.current = false;
    botQueueRef.current = [];
  }, []);

  const start = useCallback(() => {
    if (!started) {
      setStarted(true);
    }
  }, [started]);

  // Auto-start on first render
  useEffect(() => {
    start();
  }, [start]);

  return {
    stepIndex,
    data,
    busy,
    progressPct,
    progressStep,
    messages,
    typing,
    autoMode,
    setAutoMode,
    answer,
    reset,
    autoAnswer,
    currentStep,
  };
}
