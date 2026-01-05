import { openai } from '@ai-sdk/openai'
import { streamText, StreamData } from 'ai'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  const data = new StreamData()

  try {
    const body = await req.json()
    const { messages, modelId, systemPrompt, temperature, topP, data: requestData } = body
    const { userContext } = requestData || {}

    let processedMessages = messages

    if (systemPrompt) {
      processedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: { role: string }) => m.role !== 'system'),
      ]
    }

    if (userContext && userContext.trim() !== '') {
      let lastUserMessageIndex = -1
      for (let i = processedMessages.length - 1; i >= 0; i--) {
        if (processedMessages[i].role === 'user') {
          lastUserMessageIndex = i
          break
        }
      }
      const contextContent = `\n\n--- User-Provided Context ---\n${userContext}\n--- End of Context ---`
      if (lastUserMessageIndex !== -1) {
        processedMessages[lastUserMessageIndex].content += contextContent
      } else {
        if (systemPrompt) {
          processedMessages.find((m: { role: string }) => m.role === 'system')!.content += `\n${contextContent}`
        } else {
          processedMessages.unshift({ role: 'user', content: `Context for your information:\n${userContext}` })
        }
      }
    }

    const result = await streamText({
      model: openai(modelId || 'gpt-4-turbo') as any,
      messages: processedMessages,
      temperature: temperature || undefined,
      topP: topP || undefined,
      onFinish: async ({ usage, finishReason }) => {
        if (finishReason === 'stop' || finishReason === 'length') {
          data.append({ openAITokenUsage: usage })
        }
        data.close()
      },
    })

    return result.toDataStreamResponse({ data })
  } catch (error: any) {
    data.close()
    console.error('[OpenAI Chat API Error]', error)

    if (error.name === 'AI_LoadAPIKeyError') {
      return NextResponse.json(
        {
          error: 'OpenAI API key is missing or invalid.',
          type: 'API_KEY_MISSING',
        },
        { status: 400 }
      )
    } else if (error.name === 'AI_APICallError') {
      const message = error.data?.error?.message || error.message || 'An unexpected error occurred.'
      return NextResponse.json({ error: message, type: error.name }, { status: error.status || 500 })
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred.', type: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
    }
  }
}
