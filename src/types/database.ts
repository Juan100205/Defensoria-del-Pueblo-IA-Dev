export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CaseStatus = 'recibida' | 'en_analisis' | 'asignada' | 'en_tramite' | 'finalizada'
export type UrgencyLevel = 'alta' | 'media' | 'baja'
export type ComplaintType = 'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'denuncia_ddhh' | 'tutela'
export type UserRole = 'administrador' | 'coordinador' | 'analista' | 'consulta'
export type DocumentType = 'cc' | 'ce' | 'ti' | 'pasaporte' | 'nit'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: UserRole
          department: string | null
          phone: string | null
          is_active: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: UserRole
          department?: string | null
          phone?: string | null
          is_active?: boolean
          avatar_url?: string | null
        }
        Update: {
          full_name?: string
          email?: string
          role?: UserRole
          department?: string | null
          phone?: string | null
          is_active?: boolean
          avatar_url?: string | null
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          citizen_name: string
          citizen_doc_type: DocumentType
          citizen_doc: string
          citizen_email: string | null
          citizen_phone: string | null
          citizen_dept: string | null
          citizen_muni: string | null
          citizen_consent: boolean
          complaint_type: ComplaintType
          theme_id: string | null
          subject_id: string | null
          subject_text: string | null
          description: string
          status: CaseStatus
          urgency: UrgencyLevel
          assigned_to: string | null
          dependency_id: string | null
          ai_summary: string | null
          ai_tags: string[]
          ai_suggestions: string[]
          ai_duplicate_of: string | null
          ai_processed: boolean
          channel: string
          due_date: string | null
          resolved_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          case_number?: string
          citizen_name: string
          citizen_doc_type?: DocumentType
          citizen_doc: string
          citizen_email?: string | null
          citizen_phone?: string | null
          citizen_dept?: string | null
          citizen_muni?: string | null
          citizen_consent?: boolean
          complaint_type: ComplaintType
          theme_id?: string | null
          subject_id?: string | null
          subject_text?: string | null
          description: string
          status?: CaseStatus
          urgency?: UrgencyLevel
          assigned_to?: string | null
          dependency_id?: string | null
          channel?: string
          created_by?: string | null
        }
        Update: {
          status?: CaseStatus
          urgency?: UrgencyLevel
          assigned_to?: string | null
          dependency_id?: string | null
          ai_summary?: string | null
          ai_tags?: string[]
          ai_suggestions?: string[]
          ai_processed?: boolean
          resolved_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          case_id: string | null
          title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          case_id?: string | null
          title?: string | null
          is_active?: boolean
        }
        Update: {
          title?: string | null
          is_active?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
        }
        Update: never
      }
      case_messages: {
        Row: {
          id: string
          case_id: string
          author_id: string | null
          author: string
          message: string
          is_system: boolean
          created_at: string
        }
        Insert: {
          case_id: string
          author_id?: string | null
          author?: string
          message: string
          is_system?: boolean
        }
        Update: never
      }
      case_attachments: {
        Row: {
          id: string
          case_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          category: string | null
          bucket: string
          path: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          case_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          category?: string | null
          bucket?: string
          path: string
          uploaded_by?: string | null
        }
        Update: never
      }
      agent_runs: {
        Row: {
          id: string
          case_id: string
          agent_name: string
          status: string
          input_data: Json | null
          output_data: Json | null
          error_message: string | null
          duration_ms: number | null
          model_used: string | null
          tokens_used: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          case_id: string
          agent_name: string
          status?: string
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          duration_ms?: number | null
          model_used?: string | null
          tokens_used?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: never
      }
      system_settings: {
        Row: {
          key: string
          value: Json
          value_type: string
          category: string
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          value_type: string
          category?: string
          description?: string | null
        }
        Update: {
          value?: Json
          description?: string | null
        }
      }
      departments: {
        Row: { id: string; name: string; is_active: boolean }
        Insert: { name: string; is_active?: boolean }
        Update: never
      }
      municipalities: {
        Row: { id: string; department_id: string; name: string }
        Insert: { department_id: string; name: string }
        Update: never
      }
      themes: {
        Row: { id: string; name: string; slug: string }
        Insert: { name: string; slug: string }
        Update: never
      }
      subjects: {
        Row: { id: string; theme_id: string; name: string }
        Insert: { theme_id: string; name: string }
        Update: never
      }
      complaint_types: {
        Row: { id: string; name: string; slug: string }
        Insert: { name: string; slug: string }
        Update: never
      }
      internal_dependencies: {
        Row: { id: string; name: string; is_active: boolean }
        Insert: { name: string; is_active?: boolean }
        Update: never
      }
    }
    Functions: {
      get_dashboard_stats: {
        Returns: {
          total_cases: number
          active_cases: number
          urgent_cases: number
          overdue_cases: number
          resolved_this_month: number
          avg_response_days: number
        }
      }
      search_cases: {
        Args: {
          p_query?: string
          p_status?: CaseStatus
          p_department?: string
          p_complaint_type?: ComplaintType
          p_urgency?: UrgencyLevel
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          case_number: string
          citizen_name: string
          citizen_doc: string
          complaint_type: ComplaintType
          theme_name: string
          subject_text: string
          citizen_dept: string
          citizen_muni: string
          status: CaseStatus
          urgency: UrgencyLevel
          assigned_name: string
          created_at: string
          total_count: number
        }[]
      }
      get_active_alerts: {
        Returns: {
          alert_type: string
          severity: string
          title: string
          description: string
          case_number: string
          created_at: string
        }[]
      }
      reassign_case: {
        Args: {
          p_case_id: string
          p_new_assignee: string
          p_note?: string
        }
        Returns: void
      }
    }
  }
}
