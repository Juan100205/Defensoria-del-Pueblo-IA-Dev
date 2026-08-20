import { supabase } from './supabase'

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function callFunction(name: string, body: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'x-openai-key': import.meta.env.VITE_OPENAI_API_KEY || '',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `Error calling ${name}`)
  }

  return data
}

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  caseId?: string
) {
  return callFunction('chat-ai', { message, conversationId, caseId })
}

export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const { data: { session } } = await supabase.auth.getSession()

  const formData = new FormData()
  formData.append('audio', audioBlob, 'audio.webm')

  const res = await fetch(`${FUNCTIONS_BASE}/transcribe-audio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error transcribing audio')
  return data
}

export async function processCase(caseId: string) {
  return callFunction('process-case', { caseId })
}

export async function createCase(caseData: {
  citizen_name: string
  citizen_doc_type?: string
  citizen_doc: string
  citizen_email?: string
  citizen_phone?: string
  citizen_dept?: string
  citizen_muni?: string
  complaint_type: string
  description: string
  citizen_consent?: boolean
  channel?: string
}) {
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select('id, case_number')
    .single()

  if (error) throw error
  return data
}

export async function getCase(caseId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single()

  if (error) throw error
  return data
}

export async function getCases(params?: {
  query?: string
  status?: string
  department?: string
  complaint_type?: string
  urgency?: string
  page?: number
  page_size?: number
}) {
  const { data, error } = await supabase.rpc('search_cases', {
    p_query: params?.query || null,
    p_status: params?.status || null,
    p_department: params?.department || null,
    p_complaint_type: params?.complaint_type || null,
    p_urgency: params?.urgency || null,
    p_page: params?.page || 1,
    p_page_size: params?.page_size || 20,
  })

  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) throw error
  return data
}

export async function getActiveAlerts() {
  const { data, error } = await supabase.rpc('get_active_alerts')
  if (error) throw error
  return data
}

export async function updateCaseStatus(caseId: string, status: string) {
  const { error } = await supabase
    .from('cases')
    .update({ status })
    .eq('id', caseId)

  if (error) throw error
}

export async function reassignCase(caseId: string, assigneeId: string, note?: string) {
  const { error } = await supabase.rpc('reassign_case', {
    p_case_id: caseId,
    p_new_assignee: assigneeId,
    p_note: note || null,
  })
  if (error) throw error
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getCaseMessages(caseId: string) {
  const { data, error } = await supabase
    .from('case_messages')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addCaseMessage(caseId: string, message: string, authorId?: string) {
  const { data, error } = await supabase
    .from('case_messages')
    .insert({
      case_id: caseId,
      message,
      author_id: authorId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSystemSettings(category?: string) {
  let query = supabase.from('system_settings').select('*')
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateSystemSetting(key: string, value: any) {
  const { error } = await supabase
    .from('system_settings')
    .update({ value })
    .eq('key', key)
  if (error) throw error
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) throw error
  return data
}

export async function getCasesByDepartment() {
  const { data, error } = await supabase.rpc('get_cases_by_department')
  if (error) throw error
  return data
}

export async function getCasesByType() {
  const { data, error } = await supabase.rpc('get_cases_by_type')
  if (error) throw error
  return data
}

export async function getCasesByWeek() {
  const { data, error } = await supabase.rpc('get_cases_by_week')
  if (error) throw error
  return data
}

export async function getRecentActivity() {
  const { data, error } = await supabase.rpc('get_recent_activity')
  if (error) throw error
  return data
}

export async function getPortalStats() {
  const { data, error } = await supabase.rpc('get_portal_stats')
  if (error) throw error
  return data
}

export async function getTotalCasesCount() {
  const { data, error } = await supabase.rpc('get_total_cases_count')
  if (error) throw error
  return data
}

export async function getAlertsCount() {
  const { data, error } = await supabase.rpc('get_alerts_count')
  if (error) throw error
  return data
}
