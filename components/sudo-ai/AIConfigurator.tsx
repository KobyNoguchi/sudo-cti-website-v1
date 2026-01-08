'use client'

import React from 'react'
import { useAIConfig } from '@/contexts/AIConfigContext'
import { AIProvider } from '@/lib/ai/constants'
import { Square, ChevronDown } from 'lucide-react'

interface AIConfiguratorProps {
  isLoading?: boolean
  onStop?: () => void
}

export function AIConfigurator({ isLoading = false, onStop }: AIConfiguratorProps) {
  const {
    selectedProvider,
    setSelectedProvider,
    availableModels,
    selectedModel,
    setSelectedModelId,
    availablePresets,
    selectedPreset,
    setSelectedPresetId,
  } = useAIConfig()

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
      {/* Provider Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Provider</label>
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            className="appearance-none bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-md px-3 py-1.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
          >
            {Object.values(AIProvider).map((provider) => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Model Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Model</label>
        <div className="relative">
          <select
            value={selectedModel?.id || ''}
            onChange={(e) => setSelectedModelId(e.target.value)}
            disabled={availableModels.length === 0}
            className="appearance-none bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-md px-3 py-1.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer disabled:opacity-50"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Preset</label>
        <div className="relative">
          <select
            value={selectedPreset?.id || ''}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            disabled={availablePresets.length === 0 || !selectedModel}
            className="appearance-none bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-md px-3 py-1.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer disabled:opacity-50"
          >
            {availablePresets.length === 0 && selectedModel && (
              <option value="">Manual settings</option>
            )}
            {availablePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Stop Button */}
      {isLoading && onStop && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-transparent">Stop</label>
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-md transition-colors"
          >
            <Square size={12} />
            Stop
          </button>
        </div>
      )}
    </div>
  )
}


