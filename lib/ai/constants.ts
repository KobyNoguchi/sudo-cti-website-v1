export enum AIProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
}

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
}

export const OPENAI_MODELS: AIModel[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: AIProvider.OpenAI },
  { id: 'gpt-4', name: 'GPT-4', provider: AIProvider.OpenAI },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: AIProvider.OpenAI },
]

export const ANTHROPIC_MODELS: AIModel[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: AIProvider.Anthropic },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: AIProvider.Anthropic },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: AIProvider.Anthropic },
]

export const ALL_MODELS = [...OPENAI_MODELS, ...ANTHROPIC_MODELS]

export interface AIPreset {
  id: string
  name: string
  modelId: string
  provider: AIProvider
  systemPrompt?: string
  temperature?: number
  topK?: number
  topP?: number
}

export const PRESETS: AIPreset[] = [
  { 
    id: 'openai-default-gpt4-turbo', 
    name: 'OpenAI Default (GPT-4T)', 
    modelId: 'gpt-4-turbo', 
    provider: AIProvider.OpenAI, 
    systemPrompt: 'You are sudo, an advanced cyber threat intelligence analyst. Deliver clear, accurate, and actionable threat intelligence reports.',
    temperature: 0.7, 
    topK: 40, 
    topP: 0.9 
  },
  { 
    id: 'anthropic-default-sonnet4',
    name: 'Anthropic Default (Sonnet 4)',
    modelId: 'claude-sonnet-4-20250514',
    provider: AIProvider.Anthropic, 
    systemPrompt: 'You are sudo, an advanced cyber threat intelligence analyst. Deliver clear, accurate, and actionable threat intelligence reports.',
    temperature: 0.7, 
    topK: 40, 
    topP: 0.9 
  },
  { 
    id: 'openai-creative-gpt4', 
    name: 'OpenAI Creative (GPT-4)', 
    modelId: 'gpt-4', 
    provider: AIProvider.OpenAI, 
    systemPrompt: 'You are a highly creative AI assistant for cyber threat analysis.',
    temperature: 0.9, 
    topK: 50, 
    topP: 0.95 
  },
]


