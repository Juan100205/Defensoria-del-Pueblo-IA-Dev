import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../lib/api';

interface UserData {
  full_name: string | null;
  doc_type: string | null;
  doc_number: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  municipality: string | null;
  complaint_description: string | null;
}

interface ConversationContext {
  collected_fields: string[];
  missing_fields: string[];
  progress_pct: number;
  ready_to_file: boolean;
}

interface LegalContext {
  applicable_laws: string[];
  violated_rights: string[];
  deadline_days: number | null;
  suggested_department: string | null;
}

interface AiResponse {
  message: string;
  summary: string;
  branch: string | null;
  branch_detected: boolean;
  user_data: UserData;
  conversation_context: ConversationContext;
  legal_context: LegalContext;
  actions: {
    should_create_case: boolean;
    should_ask_more: boolean;
  };
  case_created?: {
    id: string;
    case_number: string;
  };
}

interface UseChatEngineReturn {
  messages: { who: 'bot' | 'me'; html: string }[];
  typing: boolean;
  busy: boolean;
  userFields: Record<string, string>;
  progressPct: number;
  branch: string | null;
  caseCreated: { id: string; case_number: string } | null;
  conversationId: string | null;
  send: (message: string) => Promise<void>;
  reset: () => void;
}

export function useChatEngine(onCaseCreated?: (caseId: string, caseNumber: string) => void): UseChatEngineReturn {
  const [messages, setMessages] = useState<{ who: 'bot' | 'me'; html: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userFields, setUserFields] = useState<Record<string, string>>({});
  const [progressPct, setProgressPct] = useState(0);
  const [branch, setBranch] = useState<string | null>(null);
  const [caseCreated, setCaseCreated] = useState<{ id: string; case_number: string } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const greetedRef = useRef(false);
  const onCaseCreatedRef = useRef(onCaseCreated);
  onCaseCreatedRef.current = onCaseCreated;

  const addBotMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { who: 'bot', html: text }]);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { who: 'me', html: text }]);
  }, []);

  const processAiResponse = useCallback((data: AiResponse) => {
    // Show only the message to the user
    if (data.message) {
      addBotMessage(data.message);
    }

    // Update user fields from AI extraction
    if (data.user_data) {
      const fields: Record<string, string> = {};
      if (data.user_data.full_name) fields['Nombre'] = data.user_data.full_name;
      if (data.user_data.doc_type && data.user_data.doc_number) {
        fields['Documento'] = `${data.user_data.doc_type.toUpperCase()} ${data.user_data.doc_number}`;
      }
      if (data.user_data.email) fields['Correo'] = data.user_data.email;
      if (data.user_data.phone) fields['Telefono'] = data.user_data.phone;
      if (data.user_data.municipality && data.user_data.department) {
        fields['Ciudad'] = `${data.user_data.municipality}, ${data.user_data.department}`;
      }
      if (data.user_data.complaint_description) {
        fields['Descripcion'] = data.user_data.complaint_description.length > 80
          ? data.user_data.complaint_description.slice(0, 80) + '...'
          : data.user_data.complaint_description;
      }
      setUserFields(fields);
    }

    // Update progress
    if (data.conversation_context) {
      setProgressPct(data.conversation_context.progress_pct || 0);
    }

    // Update branch
    if (data.branch && data.branch !== 'null') {
      setBranch(data.branch);
    }

    // Handle case creation
    if (data.case_created) {
      setCaseCreated(data.case_created);
      if (onCaseCreatedRef.current) {
        onCaseCreatedRef.current(data.case_created.id, data.case_created.case_number);
      }
    }
  }, [addBotMessage, onCaseCreatedRef]);

  const send = useCallback(async (message: string) => {
    if (busy || !message.trim()) return;

    addUserMessage(message);
    setBusy(true);
    setTyping(true);

    try {
      const result = await sendChatMessage(message, conversationId || undefined);

      if (result.error) {
        addBotMessage('Lo siento, hubo un error al procesar su mensaje. Por favor intente nuevamente.');
        return;
      }

      // Save conversation ID for subsequent messages
      if (result.conversationId && !conversationId) {
        setConversationId(result.conversationId);
      }

      // Process AI response
      if (result.response) {
        processAiResponse(result.response);
      }
    } catch (err) {
      console.error('Chat error:', err);
      addBotMessage('Lo siento, el servicio no esta disponible en este momento. Intente mas tarde.');
    } finally {
      setTyping(false);
      setBusy(false);
    }
  }, [busy, conversationId, addUserMessage, addBotMessage, processAiResponse]);

  const reset = useCallback(() => {
    setMessages([]);
    setUserFields({});
    setProgressPct(0);
    setBranch(null);
    setCaseCreated(null);
    setConversationId(null);
    setBusy(false);
    setTyping(false);
    greetedRef.current = false;
  }, []);

  // Auto-greet on first render
  useEffect(() => {
    if (!greetedRef.current) {
      greetedRef.current = true;
      addBotMessage(
        'Buenas tardes. Soy el asistente virtual de la Defensoria del Pueblo de Colombia. ' +
        'Estoy aqui para ayudarle a radicar su solicitud, queja, reclamo o tutela.<br/><br/>' +
        '<b>Para comenzar, por favor indiqueme su nombre completo.</b>'
      );
    }
  }, [addBotMessage]);

  return {
    messages,
    typing,
    busy,
    userFields,
    progressPct,
    branch,
    caseCreated,
    conversationId,
    send,
    reset,
  };
}
