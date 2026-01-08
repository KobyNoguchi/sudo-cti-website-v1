'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { AIProvider, AIModel, AIPreset, ALL_MODELS, PRESETS } from '@/lib/ai/constants'

interface AIConfigContextProps {
  selectedProvider: AIProvider
  setSelectedProvider: (provider: AIProvider) => void
  availableModels: AIModel[]
  selectedModel: AIModel | null
  setSelectedModelId: (modelId: string) => void
  availablePresets: AIPreset[]
  selectedPreset: AIPreset | null
  setSelectedPresetId: (presetId: string) => void
  temperature: number
  setTemperature: (temp: number) => void
  topK: number
  setTopK: (k: number) => void
  topP: number
  setTopP: (p: number) => void
  systemPrompt: string
  setSystemPrompt: (prompt: string) => void
}

const AIConfigContext = createContext<AIConfigContextProps | undefined>(undefined)

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>(AIProvider.Anthropic)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModelState] = useState<AIModel | null>(null)
  const [availablePresets, setAvailablePresets] = useState<AIPreset[]>([])
  const [selectedPreset, setSelectedPresetState] = useState<AIPreset | null>(null)

  const [temperature, setTemperatureState] = useState(0.7)
  const [topK, setTopKState] = useState(40)
  const [topP, setTopPState] = useState(0.9)
  const [systemPrompt, setSystemPromptState] = useState('You are sudo, an advanced cyber threat intelligence analyst.')

  useEffect(() => {
    const modelsForProvider = ALL_MODELS.filter(m => m.provider === selectedProvider)
    setAvailableModels(modelsForProvider)
    if (modelsForProvider.length > 0) {
      if (!selectedModel || selectedModel.provider !== selectedProvider) {
        setSelectedModelState(modelsForProvider[0])
      }
    } else {
      setSelectedModelState(null)
    }
  }, [selectedProvider, selectedModel])

  useEffect(() => {
    if (selectedModel) {
      const presetsForModel = PRESETS.filter(p => p.modelId === selectedModel.id && p.provider === selectedModel.provider)
      setAvailablePresets(presetsForModel)
      if (presetsForModel.length > 0) {
        if(!selectedPreset || selectedPreset.modelId !== selectedModel.id) {
            setSelectedPresetState(presetsForModel[0])
        }
      } else {
        setSelectedPresetState(null)
      }
    } else {
      setAvailablePresets([])
      setSelectedPresetState(null)
    }
  }, [selectedModel, selectedPreset])
  
  useEffect(() => {
    if (selectedPreset) {
      setTemperatureState(selectedPreset.temperature ?? 0.7)
      setTopKState(selectedPreset.topK ?? 40)
      setTopPState(selectedPreset.topP ?? 0.9)
      setSystemPromptState(selectedPreset.systemPrompt ?? 'You are sudo, an advanced cyber threat intelligence analyst.')
    }
  }, [selectedPreset])

  const setSelectedProvider = useCallback((provider: AIProvider) => {
    setSelectedProviderState(provider)
  }, [])

  const setSelectedModelId = useCallback((modelId: string) => {
    const model = ALL_MODELS.find(m => m.id === modelId && m.provider === selectedProvider)
    setSelectedModelState(model || null)
  }, [selectedProvider])
  
  const setSelectedPresetId = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId)
    setSelectedPresetState(preset || null)
    if (preset) {
      const modelForPreset = ALL_MODELS.find(m => m.id === preset.modelId && m.provider === preset.provider)
      if (modelForPreset && selectedProvider !== modelForPreset.provider) {
        setSelectedProviderState(modelForPreset.provider)
      }
      setSelectedModelState(modelForPreset || null)
    }
  }, [selectedProvider])

  const setTemperature = useCallback((temp: number) => {
    setTemperatureState(temp)
    setSelectedPresetState(null)
  }, [])

  const setTopK = useCallback((k: number) => {
    setTopKState(k)
    setSelectedPresetState(null)
  }, [])

  const setTopP = useCallback((p: number) => {
    setTopPState(p)
    setSelectedPresetState(null)
  }, [])

  const setSystemPrompt = useCallback((prompt: string) => {
    setSystemPromptState(prompt)
    setSelectedPresetState(null)
  }, [])

  return (
    <AIConfigContext.Provider value={{
      selectedProvider, setSelectedProvider,
      availableModels, selectedModel, setSelectedModelId,
      availablePresets, selectedPreset, setSelectedPresetId,
      temperature, setTemperature,
      topK, setTopK,
      topP, setTopP,
      systemPrompt, setSystemPrompt
    }}>
      {children}
    </AIConfigContext.Provider>
  )
}

export function useAIConfig() {
  const context = useContext(AIConfigContext)
  if (context === undefined) {
    throw new Error('useAIConfig must be used within an AIConfigProvider')
  }
  return context
}


