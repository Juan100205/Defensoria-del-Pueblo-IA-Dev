-- ============================================================
-- 005_chat_tables.sql
-- Tablas de conversaciones y mensajes para chat IA
-- ============================================================

-- Conversaciones del chat IA
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  title       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensajes de las conversaciones
CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content          TEXT NOT NULL,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resultados del procesamiento paso a paso del chatbot de radicación
CREATE TABLE step_results (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_key         TEXT NOT NULL,
  step_index       INTEGER NOT NULL,
  value            TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_case ON conversations(case_id);
CREATE INDEX idx_conversations_active ON conversations(is_active) WHERE is_active = true;
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_step_results_case ON step_results(case_id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_results ENABLE ROW LEVEL SECURITY;

-- Conversations: usuario ve las suyas, admin ve todas
CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "conversations_select_admin" ON conversations
  FOR SELECT USING (is_admin());

CREATE POLICY "conversations_insert_auth" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_update_own" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "conversations_update_admin" ON conversations
  FOR UPDATE USING (is_admin());

-- Messages: accesibles si el usuario tiene acceso a la conversación
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.user_id = auth.uid()
        OR is_admin()
      )
    )
  );

-- Step results: admin y coordinador
CREATE POLICY "step_results_select" ON step_results
  FOR SELECT USING (
    get_user_role() IN ('administrador', 'coordinador', 'analista')
  );

CREATE POLICY "step_results_insert" ON step_results
  FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
