import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-openai-key",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY")

    if (!openaiKey) {
      return new Response(JSON.stringify({
        error: "Servicio de transcripción no disponible",
        fallback: true,
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No se proporcionó audio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Send to OpenAI Whisper
    const aiFormData = new FormData()
    aiFormData.append("file", audioFile, "audio.webm")
    aiFormData.append("model", "whisper-1")
    aiFormData.append("language", "es")

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: aiFormData,
    })

    if (!whisperResponse.ok) {
      const errText = await whisperResponse.text()
      console.error("Whisper error:", errText)
      throw new Error("Error en la transcripción")
    }

    const result = await whisperResponse.json()

    return new Response(JSON.stringify({
      text: result.text,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({
      error: "No fue posible transcribir el audio. Inténtelo nuevamente.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
