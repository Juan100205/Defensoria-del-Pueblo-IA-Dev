import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  isAvailable: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const recognitionRef = useRef<any>(null)
  const startedRef = useRef(false)

  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

  const isSupported = !!SpeechRecognition

  useEffect(() => {
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-CO'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim())
      } else if (interimTranscript) {
        setTranscript(interimTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error)
      setIsListening(false)
      startedRef.current = false

      switch (event.error) {
        case 'no-speech':
          setError('No se detectó voz. Intente de nuevo.')
          break
        case 'audio-capture':
          setError('No se pudo acceder al micrófono. Verifica los permisos del navegador.')
          break
        case 'not-allowed':
          setError('Permiso de micrófono denegado. Haz clic en el candado en la barra de direcciones para habilitarlo.')
          break
        case 'network':
          setError('Error de red del navegador. Use Chrome/Edge o pruebe la transcripción del servidor.')
          setIsAvailable(false)
          break
        case 'service-not-allowed':
          setError('El servicio de reconocimiento no está disponible. Use la transcripción del servidor.')
          setIsAvailable(false)
          break
        default:
          setError('Error al reconocer voz. Intente de nuevo.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      startedRef.current = false
    }

    recognitionRef.current = recognition

    // Check if mic is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach(t => t.stop())
          setIsAvailable(true)
        })
        .catch(() => {
          setIsAvailable(false)
        })
    }

    return () => {
      try { recognition.abort() } catch {}
    }
  }, [SpeechRecognition])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Reconocimiento de voz no disponible. Use Chrome o Edge.')
      return
    }

    if (!isAvailable) {
      setError('Micrófono no disponible. Verifica permisos o use la transcripción del servidor.')
      return
    }

    setError(null)
    setTranscript('')

    try {
      if (startedRef.current) {
        recognitionRef.current.abort()
      }
      recognitionRef.current.start()
      startedRef.current = true
      setIsListening(true)
    } catch (e: any) {
      console.error('Failed to start recognition:', e)
      if (e.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Habilita el permiso en tu navegador.')
      } else if (e.name === 'NotFoundError') {
        setError('No se encontró micrófono. Conecta un dispositivo de audio.')
      } else {
        setError('No se pudo iniciar el reconocimiento de voz.')
      }
    }
  }, [isAvailable])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && startedRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsListening(false)
    startedRef.current = false
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    isAvailable,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
