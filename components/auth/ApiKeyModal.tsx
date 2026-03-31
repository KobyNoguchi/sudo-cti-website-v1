'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { anthropicApiKey, openAiApiKey, setAnthropicApiKey, setOpenAiApiKey } = useAuth()

  const [anthropicInput, setAnthropicInput] = useState(anthropicApiKey || '')
  const [openAiInput, setOpenAiInput] = useState(openAiApiKey || '')
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [showOpenAi, setShowOpenAi] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (anthropicInput.trim()) await setAnthropicApiKey(anthropicInput.trim())
      if (openAiInput.trim()) await setOpenAiApiKey(openAiInput.trim())
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1200)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setAnthropicInput(anthropicApiKey || '')
    setOpenAiInput(openAiApiKey || '')
    setSaved(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md"
            >
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
                    <p className="text-slate-400 text-sm">
                      Your keys are stored securely in your account and never shared.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Anthropic Key */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Anthropic API Key <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showAnthropic ? 'text' : 'password'}
                          value={anthropicInput}
                          onChange={(e) => setAnthropicInput(e.target.value)}
                          placeholder="sk-ant-..."
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAnthropic(!showAnthropic)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {showAnthropic ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* OpenAI Key */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        OpenAI API Key <span className="text-slate-500 text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showOpenAi ? 'text' : 'password'}
                          value={openAiInput}
                          onChange={(e) => setOpenAiInput(e.target.value)}
                          placeholder="sk-..."
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOpenAi(!showOpenAi)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {showOpenAi ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={isSaving || !anthropicInput.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saved ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Saved!
                        </>
                      ) : isSaving ? (
                        'Saving...'
                      ) : (
                        'Save Keys'
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-slate-500 text-center">
                    Keys are encrypted at rest via Supabase Row Level Security.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
