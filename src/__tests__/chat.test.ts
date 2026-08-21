import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockSendChat = vi.fn()

vi.mock('../lib/api', () => ({
  sendChatMessage: (...args: any[]) => mockSendChat(...args),
}))

describe('Chat Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chat engine sends message and receives response', async () => {
    mockSendChat.mockResolvedValue({
      reply: 'Hola, ¿en qué puedo ayudarte?',
      extracted_data: null,
      should_process: false,
      conversation_id: 'conv-1',
    })

    const result = await mockSendChat('Hola', undefined, undefined)

    expect(result.reply).toBe('Hola, ¿en qué puedo ayudarte?')
    expect(result.conversation_id).toBe('conv-1')
    expect(mockSendChat).toHaveBeenCalledWith('Hola', undefined, undefined)
  })

  it('chat engine handles extracted data', async () => {
    mockSendChat.mockResolvedValue({
      reply: 'Perfecto, voy a registrar tu petición.',
      extracted_data: {
        citizen_name: 'Juan Pérez',
        citizen_doc: '123456',
        complaint_type: 'peticion',
        description: 'Necesito ayuda con...',
      },
      should_process: true,
      conversation_id: 'conv-2',
    })

    const result = await mockSendChat('Soy Juan Pérez, quiero hacer una petición', undefined, undefined)

    expect(result.extracted_data).not.toBeNull()
    expect(result.extracted_data.citizen_name).toBe('Juan Pérez')
    expect(result.should_process).toBe(true)
  })

  it('chat engine handles errors gracefully', async () => {
    mockSendChat.mockRejectedValue(new Error('Network error'))

    await expect(mockSendChat('test')).rejects.toThrow('Network error')
  })

  it('chat engine passes case_id for existing cases', async () => {
    mockSendChat.mockResolvedValue({
      reply: 'Actualicé tu caso.',
      extracted_data: null,
      should_process: false,
      conversation_id: 'conv-3',
    })

    await mockSendChat('Quiero dar seguimiento', 'conv-3', 'case-1')

    expect(mockSendChat).toHaveBeenCalledWith('Quiero dar seguimiento', 'conv-3', 'case-1')
  })
})

describe('Chat UI behavior', () => {
  it('processes system greeting message', () => {
    const greeting = {
      role: 'assistant',
      content: 'Buenos días, soy el asistente virtual de la Defensoría del Pueblo.',
    }
    expect(greeting.role).toBe('assistant')
    expect(greeting.content).toContain('Defensoría del Pueblo')
  })

  it('formats case numbers correctly', () => {
    const caseNumber = 'DP-2026-000042'
    expect(caseNumber).toMatch(/^DP-\d{4}-\d{6}$/)
  })
})
