'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import { useChat, Message } from 'ai/react'
import { Send, Plus, X, Paperclip, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAIConfig } from '@/contexts/AIConfigContext'
import { AIProvider } from '@/lib/ai/constants'
import { AIConfigurator } from './AIConfigurator'
import { UploadedFileContext } from '@/lib/ai/types'

export default function SudoChat() {
  const [uploadedFileContexts, setUploadedFileContexts] = useState<UploadedFileContext[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const {
    selectedProvider,
    selectedModel,
    selectedPreset,
    temperature,
    topK,
    topP,
    systemPrompt,
  } = useAIConfig()

  const apiPath = selectedProvider === AIProvider.OpenAI ? '/api/openai/chat' : '/api/anthropic/chat'

  const getSystemPrompt = useCallback(() => {
    let finalSystemPrompt = selectedPreset?.systemPrompt || systemPrompt

    if (uploadedFileContexts.length > 0) {
      finalSystemPrompt += `\n\n--- Uploaded Files Content ---\n${uploadedFileContexts.map(fileCtx => 
        `--- File: ${fileCtx.name} (Type: ${fileCtx.type}) ---\n${fileCtx.content}\n--- End of File: ${fileCtx.name} ---\n\n`
      ).join('')}`
    }

    return finalSystemPrompt.trim()
  }, [selectedPreset?.systemPrompt, systemPrompt, uploadedFileContexts])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop } = useChat({
    api: apiPath,
    body: {
      modelId: selectedModel?.id,
      systemPrompt: getSystemPrompt(),
      temperature: selectedPreset?.temperature ?? temperature,
      topK: selectedPreset?.topK ?? topK,
      topP: selectedPreset?.topP ?? topP,
    },
  })

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const customSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }, [handleSubmit, input])

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const result = await response.json()
      const fileId = `${file.name}-${Date.now()}`

      const newFileContext: UploadedFileContext = {
        id: fileId,
        name: result.fileName || file.name,
        type: result.fileType || file.type,
        content: result.extractedText || '',
      }

      setUploadedFileContexts(prev => [...prev, newFileContext])
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    e.target.value = ''
  }

  const removeFile = (fileId: string) => {
    setUploadedFileContexts(prev => prev.filter(f => f.id !== fileId))
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <AIConfigurator isLoading={isLoading} onStop={stop} />
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-6 ${!hasMessages ? 'flex items-center justify-center' : ''}`}>
        {!hasMessages && !isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">sudo</h2>
            <p className="text-slate-400 max-w-md">
              AI-powered cyber threat intelligence. Upload documents, ask questions, and get actionable insights.
            </p>
          </div>
        )}

        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message: Message, index: number) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="text-xs text-cyan-400 font-medium mb-2">
                    {selectedModel?.name || 'AI Assistant'}
                  </div>
                )}
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-900/50 border border-red-700 p-4 rounded-2xl text-red-200">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error.message || 'An error occurred'}</p>
              </div>
            </div>
          )}

          <div ref={scrollAnchorRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        {/* Uploaded Files Pills */}
        {uploadedFileContexts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {uploadedFileContexts.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded-full border border-emerald-700"
              >
                <Paperclip size={12} />
                {file.name}
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-1 hover:text-emerald-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={customSubmit} className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".txt,.md,.docx"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Upload file"
          >
            <Plus size={20} />
          </button>

          <div className="flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about cyber threats, vulnerabilities, or upload a report for analysis..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  customSubmit(e as unknown as FormEvent<HTMLFormElement>)
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
