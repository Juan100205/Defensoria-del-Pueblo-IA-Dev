import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key",
}

const BRANCH_PROMPTS: Record<string, string> = {
  peticion: `RAMA: PETICION / SOLICITUD
El ciudadano ejerce su derecho a presentar peticiones conforme al Articulo 23 de la Constitucion Politica y la Ley 1755 de 2015.
Enfocate en:
- Que esta solicitando el ciudadano (informacion, actuacion, pronunciamiento, deferencia)
- Plazo de respuesta: 15 dias habiles (Ley 1755 de 2015, Art. 14)
- Derechos fundamentales involucrados: peticion, informacion, respuesta
- Normativa: Constitucion Art. 23, Ley 1755 de 2015, Codigo de Procedimiento Administrativo (CPACA) Art. 14-29`,

  queja: `RAMA: QUEJA
El ciudadano manifiesta inconformidad con la conducta de un servidor publico o entidad.
Enfocate en:
- Que hizo o dejo de hacer el servidor/entidad
- Fecha y lugar de los hechos
- Identificacion del funcionario o entidad involucrada
- Derechos vulnerados: buen nombre, debido proceso, servicio publico eficiente
- Normativa: Constitucion Arts. 123, 209; Ley 1474 de 2011 (Estatuto Anticorrupcion); CPACA Art. 14
- Si hay indicios de corrupcion o disciplinario, indicarlo`,

  reclamo: `RAMA: RECLAMO
El ciudadano manifiesta insatisfaccion con un servicio publico o privado que no fue prestado adecuadamente.
Enfocate en:
- Que servicio debio prestarse y como se incumplio
- Fecha del incumplimiento o deficiencia
- Entidad prestadora del servicio
- Dano causado al ciudadano
- Derechos vulnerados: acceso a servicios publicos, servicio publico eficiente
- Normativa: Constitucion Arts. 365-368; Ley 142 de 1994 (Servicios Publicos Domiciliarios); Decreto 1842 de 2016`,

  tutela: `RAMA: TUTELA
El ciudadano necesita acompanamiento para interponer una accion de tutela ante un juez.
Enfocate en:
- Derecho fundamental vulnerado o amenazado
- Accion u omision del particular o autoridad publica
- Si es procedente (Art. 86 Constitucion)
- Requisitos: identificacion del accionante, autoridad o particular, hechos, derecho fundamental, pretension
- Normativa: Constitucion Art. 86; Decreto 2591 de 1991; Art. 4 Constitucion (fundamentos del Estado)
- IMPORTANTE: evalua si hay otro medio de defensa judicial. Si lo hay, la tutela es improcedente salvo como mecanismo transitorio.`,
}

const REQUIRED_FIELDS = ["full_name", "doc_type", "doc_number", "email", "phone", "department", "municipality", "complaint_description"]

const SYSTEM_PROMPT_BASE = `Eres el asistente virtual de la Defensoria del Pueblo de Colombia. Tu funcion es ayudar a los ciudadanos a radicar solicitudes, quejas, reclamos o tutelas.

REGLAS ESTRICTAS:
1. Responde SIEMPRE con un JSON valido. Nada de texto antes o despues.
2. Usa exactamente este esquema:
{
  "message": "Respuesta conversacional para el ciudadano. TEXTO PLANO sin JSON ni corchetes. Tono empatico y profesional.",
  "summary": "Resumen de lo que el ciudadano ha narrado hasta ahora (max 4 lineas)",
  "branch": "peticion|queja|reclamo|sugerencia|denuncia_ddhh|tutela|null",
  "branch_detected": false,
  "user_data": {
    "full_name": "nombre completo o null",
    "doc_type": "cc|ce|ti|pasaporte|nit o null",
    "doc_number": "numero de documento limpio o null",
    "email": "correo electronico o null",
    "phone": "telefono o null",
    "department": "departamento o null",
    "municipality": "municipio o null",
    "complaint_description": "descripcion de la queja/solicitud del ciudadano o null"
  },
  "conversation_context": {
    "collected_fields": ["campo1", "campo2"],
    "missing_fields": ["campo3", "campo4"],
    "progress_pct": 25,
    "ready_to_file": false
  },
  "legal_context": {
    "applicable_laws": ["Ley/Articulo especifico"],
    "violated_rights": ["derecho1", "derecho2"],
    "deadline_days": 15,
    "suggested_department": "nombre de la dependencia interna"
  },
  "actions": {
    "should_create_case": false,
    "should_ask_more": true
  }
}

COMO FUNCIONA:
- El ciudadano te escribe libremente. Tu extraes los datos del contexto.
- Progresivamente completa los campos de user_data a medida que el ciudadano los mencione.
- Cuando detectes el tipo de solicitud, marca branch_detected como true y asigna el branch.
- Incluye contexto legal en legal_context segun la branch detectada.
- Cuando TODOS los campos obligatorios esten completos (full_name, doc_type, doc_number, email, phone, department, municipality, complaint_description), marca ready_to_file como true Y should_create_case como true.
- El campo message NUNCA debe contener JSON. Es solo texto plano para mostrar al ciudadano.
- Si el ciudadano solo saluda, responde con un saludo y pregunta por su nombre.
- Si el ciudadano da un dato, agradecelo y pregunta por el siguiente dato faltante.
- Sé empatico y profesional. Recuerda que eres la Defensoria del Pueblo.
- Si el ciudadano menciona un numero de radicado, indica que no puedes consultar estados en este momento y guialo a radicar una nueva solicitud si lo necesita.`

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || req.headers.get("x-openai-key")

    // Client with service role for all data operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Allow anonymous citizens (no auth required)
    let userId: string | null = null
    const authHeader = req.headers.get("Authorization")
    if (authHeader) {
      try {
        const authClient = createClient(supabaseUrl, supabaseServiceKey, {
          global: { headers: { Authorization: authHeader } },
        })
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          // Verify profile exists before using user_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single()
          if (profile) userId = user.id
        }
      } catch {
        // Anonymous citizen, continue without user_id
      }
    }

    const { conversationId, message } = await req.json()

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Mensaje vacio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: message.slice(0, 100),
        })
        .select("id")
        .single()

      if (convError) throw convError
      convId = conv.id
    }

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    })

    // Get conversation history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content, metadata")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(50)

    // Build system prompt with branch context from previous messages
    let systemPrompt = SYSTEM_PROMPT_BASE

    // Detect if a branch was already identified in previous assistant messages
    if (history && history.length > 1) {
      for (const msg of history) {
        if (msg.role === "assistant" && msg.metadata) {
          const meta = typeof msg.metadata === "string" ? JSON.parse(msg.metadata) : msg.metadata
          if (meta?.branch && meta.branch !== "null") {
            const branchPrompt = BRANCH_PROMPTS[meta.branch]
            if (branchPrompt) {
              systemPrompt += "\n\n" + branchPrompt
            }
            break
          }
        }
      }
    }

    if (!openaiKey) {
      // Fallback without AI
      const fallbackResponse = {
        message: "Lo siento, el servicio de IA no esta disponible en este momento. Por favor intente mas tarde o contacte la linea de atencion 018000 914814.",
        summary: "",
        branch: null,
        branch_detected: false,
        user_data: {
          full_name: null, doc_type: null, doc_number: null,
          email: null, phone: null, department: null,
          municipality: null, complaint_description: null,
        },
        conversation_context: {
          collected_fields: [], missing_fields: REQUIRED_FIELDS,
          progress_pct: 0, ready_to_file: false,
        },
        legal_context: {
          applicable_laws: [], violated_rights: [],
          deadline_days: null, suggested_department: null,
        },
        actions: { should_create_case: false, should_ask_more: true },
      }

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: fallbackResponse.message,
        metadata: fallbackResponse,
      })

      return new Response(JSON.stringify({
        conversationId: convId,
        response: fallbackResponse,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Build messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
    ]

    // Call OpenAI with JSON response format
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.2,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error("OpenAI error:", errText)
      throw new Error("Error del servicio de IA")
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices[0].message.content

    // Parse JSON response
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    }

    if (!parsed) {
      throw new Error("No se pudo parsear la respuesta de IA")
    }

    // Build structured response
    const user_data = parsed.user_data || {}
    const conversation_context = parsed.conversation_context || {}
    const legal_context = parsed.legal_context || {}
    const actions = parsed.actions || {}

    const aiResponseData = {
      message: parsed.message || "Entendido. Cuénteme más detalles sobre su solicitud.",
      summary: parsed.summary || "",
      branch: parsed.branch || null,
      branch_detected: parsed.branch_detected || false,
      user_data: {
        full_name: user_data.full_name || null,
        doc_type: user_data.doc_type || null,
        doc_number: user_data.doc_number || null,
        email: user_data.email || null,
        phone: user_data.phone || null,
        department: user_data.department || null,
        municipality: user_data.municipality || null,
        complaint_description: user_data.complaint_description || null,
      },
      conversation_context: {
        collected_fields: conversation_context.collected_fields || [],
        missing_fields: conversation_context.missing_fields || REQUIRED_FIELDS,
        progress_pct: conversation_context.progress_pct || 0,
        ready_to_file: conversation_context.ready_to_file || false,
      },
      legal_context: {
        applicable_laws: legal_context.applicable_laws || [],
        violated_rights: legal_context.violated_rights || [],
        deadline_days: legal_context.deadline_days || null,
        suggested_department: legal_context.suggested_department || null,
      },
      actions: {
        should_create_case: actions.should_create_case || false,
        should_ask_more: actions.should_ask_more !== false,
      },
    }

    // Save assistant message with full metadata
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: aiResponseData.message,
      metadata: aiResponseData,
    })

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId)

    // Auto-create case if AI says to
    let caseCreated = null
    if (aiResponseData.actions.should_create_case && aiResponseData.user_data.full_name) {
      const ud = aiResponseData.user_data
      const branch = aiResponseData.branch || "peticion"

      // Map doc_type to valid enum values
      const docTypeMap: Record<string, string> = {
        cc: "cc", cedula: "cc", cedula_ciudadania: "cc",
        ce: "ce", cedula_extranjeria: "ce",
        ti: "ti", tarjeta_identidad: "ti",
        pasaporte: "pasaporte", passport: "pasaporte",
        nit: "nit",
      }
      const docType = docTypeMap[(ud.doc_type || "").toLowerCase()] || "cc"

      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          citizen_name: ud.full_name,
          citizen_doc_type: docType,
          citizen_doc: (ud.doc_number || "").replace(/[^0-9]/g, ""),
          citizen_email: ud.email || null,
          citizen_phone: ud.phone || null,
          citizen_dept: ud.department || null,
          citizen_muni: ud.municipality || null,
          complaint_type: branch,
          description: ud.complaint_description || aiResponseData.summary,
          channel: "chatbot",
          status: "recibida",
          urgency: "media",
          created_by: userId,
          ai_summary: aiResponseData.summary,
          ai_tags: aiResponseData.legal_context.applicable_laws || [],
          ai_processed: true,
          subject_text: (ud.complaint_description || aiResponseData.summary || "").slice(0, 100),
        })
        .select("id, case_number")
        .single()

      if (caseError) {
        console.error("Error creating case:", caseError)
      } else {
        caseCreated = newCase

        // Link conversation to case
        await supabase
          .from("conversations")
          .update({ case_id: newCase.id })
          .eq("id", convId)

        // Save legal context as step_results
        if (aiResponseData.legal_context.applicable_laws.length > 0) {
          await supabase.from("step_results").insert({
            case_id: newCase.id,
            step_key: "legal_context",
            step_index: 0,
            value: JSON.stringify(aiResponseData.legal_context),
          })
        }

        // Update the last assistant message with case info
        aiResponseData.case_created = {
          id: newCase.id,
          case_number: newCase.case_number,
        }
      }
    }

    return new Response(JSON.stringify({
      conversationId: convId,
      response: aiResponseData,
      case_created: caseCreated,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({
      error: "No fue posible procesar su solicitud. Intente nuevamente.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
