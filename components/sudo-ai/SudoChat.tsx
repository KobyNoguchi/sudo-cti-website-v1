'use client'

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import { useChat, Message } from 'ai/react'
import { Send, Plus, X, ChevronDown, Square, Sparkles, MoreVertical, FileText, Settings, KeyRound } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAIConfig } from '@/contexts/AIConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { AIProvider } from '@/lib/ai/constants'
import { AIConfigurator } from './AIConfigurator'
import { UploadedFileContext, CisaVulnerability, NvdVulnerability, GreyNoiseItem, Technique } from '@/lib/ai/types'

// Import data source popups
import CisaKevPopup from './CisaKevPopup'
import NvdPopup from './NvdPopup'
import GreyNoisePopup from './GreyNoisePopup'
import MitreAttackMatrixModal from './MitreAttackMatrixModal'
import MitreEnterpriseMatrixModal from './MitreEnterpriseMatrixModal'

// Prompt template interface
interface PromptTemplate {
  name: string
  content: string
}

interface SudoChatProps {
  onOpenApiKeyModal?: () => void
}

export default function SudoChat({ onOpenApiKeyModal }: SudoChatProps) {
  // File and context state
  const [uploadedFileContexts, setUploadedFileContexts] = useState<UploadedFileContext[]>([])
  const [contextVulnerabilities, setContextVulnerabilities] = useState<CisaVulnerability[]>([])
  const [contextNvdVulnerabilities, setContextNvdVulnerabilities] = useState<NvdVulnerability[]>([])
  const [contextGreyNoiseItems, setContextGreyNoiseItems] = useState<GreyNoiseItem[]>([])
  const [contextMitreTechniques, setContextMitreTechniques] = useState<Technique[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  // Data source popup states
  const [isCisaKevPopupOpen, setIsCisaKevPopupOpen] = useState(false)
  const [isNvdPopupOpen, setIsNvdPopupOpen] = useState(false)
  const [isGreyNoisePopupOpen, setIsGreyNoisePopupOpen] = useState(false)
  const [isMitreIcsModalOpen, setIsMitreIcsModalOpen] = useState(false)
  const [isMitreEnterpriseModalOpen, setIsMitreEnterpriseModalOpen] = useState(false)

  // Data source state (for sidebar highlight)
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null)
  const [isMitreDropdownOpen, setIsMitreDropdownOpen] = useState(false)

  // Prompt templates
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    {
      name: 'National Grid Threat Intel Template',
      content: `-Take the role of a lead cyber threat intelligence analyst and write a concise intelligence report given the attached pdf file for context. Assume we are part of a multi national electric and gas utility that operates within both the US and the UK. Be as verbose as possible. Include future mitigation strategies as well as potential for operational impact. Include threat actor affiliation, motivation and capability.

-Always start the first sentence in an intelligence summary with:
On {xx numbered day format} {Month with the first letter capitalized} {Year, all four digits}, researcher's at {publisher} released a report {regarding, pertaining} to {a threat activity cluster, a campaign, vulnerability etc.}.

-The second sentence should include industry targeted as well as organizations impacted if disclosed. 

-The third sentence should disclose threat actor affiliation, whether it's with a nation state group, hacktivist persona or eCrime. 

-The rest of the first paragraph should include past campaigns perpetrated by this threat group or malware, their capabilities within the ICS Kill chain etc.

-Add a secondary paragraph explaining the technical aspects of this campaign, include the initial access vector if present, CVE's and TTPs used in the compromise if present`
    }
  ])
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(promptTemplates[0])

  // Modal states
  const [isPromptContextModalOpen, setIsPromptContextModalOpen] = useState(false)
  const [isSamplePromptsModalOpen, setIsSamplePromptsModalOpen] = useState(false)
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null)
  const [modalView, setModalView] = useState<'list' | 'create' | 'edit'>('list')
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileContent, setNewProfileContent] = useState('')
  const [profileToEdit, setProfileToEdit] = useState<PromptTemplate | null>(null)
  const [editingProfileName, setEditingProfileName] = useState('')
  const [editingProfileContent, setEditingProfileContent] = useState('')

  // Sample prompts dropdown
  const [isSamplePromptsDropdownOpen, setIsSamplePromptsDropdownOpen] = useState(false)

  const {
    selectedProvider,
    selectedModel,
    selectedPreset,
    temperature,
    topK,
    topP,
    systemPrompt,
  } = useAIConfig()

  const { anthropicApiKey, openAiApiKey } = useAuth()

  const apiPath = selectedProvider === AIProvider.OpenAI ? '/api/openai/chat' : '/api/anthropic/chat'
  const activeApiKey = selectedProvider === AIProvider.OpenAI ? openAiApiKey : anthropicApiKey

  const getSystemPrompt = useCallback(() => {
    let finalSystemPrompt = activeTemplate?.content || selectedPreset?.systemPrompt || systemPrompt

    if (contextVulnerabilities.length > 0) {
      const cisaContext = contextVulnerabilities.map(vuln =>
        `CISA KEV Vulnerability ID: ${vuln.cveID}\nProduct: ${vuln.product}\nVulnerability Name: ${vuln.vulnerabilityName}\nDate Added: ${vuln.dateAdded}`
      ).join('\n\n')
      finalSystemPrompt += `\n\n--- CISA KEV In-Context ---\n${cisaContext}`
    }

    if (contextNvdVulnerabilities.length > 0) {
      const nvdContext = contextNvdVulnerabilities.map(vuln =>
        `NVD Vulnerability ID: ${vuln.cve.id}\nDescription: ${vuln.cve.descriptions.find(d => d.lang === 'en')?.value || 'N/A'}\nPublished: ${vuln.cve.published}`
      ).join('\n\n')
      finalSystemPrompt += `\n\n--- NVD Vulnerabilities In-Context ---\n${nvdContext}`
    }

    if (contextGreyNoiseItems.length > 0) {
      const greyNoiseContext = contextGreyNoiseItems.map(item =>
        `GreyNoise: ${item.title}\nSummary: ${item.description.summaryText || 'N/A'}\nIntention: ${item.description.intention || 'Unknown'}\nCategory: ${item.description.category || 'Unknown'}`
      ).join('\n\n')
      finalSystemPrompt += `\n\n--- GreyNoise Intelligence In-Context ---\n${greyNoiseContext}`
    }

    if (contextMitreTechniques.length > 0) {
      const mitreContext = contextMitreTechniques.map(tech =>
        `MITRE ATT&CK Technique ID: ${tech.id}\nTechnique Name: ${tech.name}`
      ).join('\n\n')
      finalSystemPrompt += `\n\n--- MITRE ATT&CK Techniques In-Context ---\n${mitreContext}`
    }

    if (uploadedFileContexts.length > 0) {
      finalSystemPrompt += `\n\n--- Uploaded Files Content ---\n${uploadedFileContexts.map(fileCtx =>
        `--- File: ${fileCtx.name} (Type: ${fileCtx.type}) ---\n${fileCtx.content}\n--- End of File: ${fileCtx.name} ---\n\n`
      ).join('')}`
    }

    return finalSystemPrompt.trim()
  }, [activeTemplate?.content, selectedPreset?.systemPrompt, systemPrompt, contextVulnerabilities, contextNvdVulnerabilities, contextGreyNoiseItems, contextMitreTechniques, uploadedFileContexts])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop } = useChat({
    api: apiPath,
    body: {
      modelId: selectedModel?.id,
      systemPrompt: getSystemPrompt(),
      temperature: selectedPreset?.temperature ?? temperature,
      topK: selectedPreset?.topK ?? topK,
      topP: selectedPreset?.topP ?? topP,
      apiKey: activeApiKey,
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

      if (!response.ok) throw new Error('Failed to process file')

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
    if (file) handleFileUpload(file)
    e.target.value = ''
  }

  const removeFile = (fileId: string) => {
    setUploadedFileContexts(prev => prev.filter(f => f.id !== fileId))
  }

  const removeTemplate = () => {
    setActiveTemplate({ name: '', content: '' })
  }

  // Prompt Context Modal handlers
  const handleAddNewProfile = () => {
    if (newProfileName.trim() && newProfileContent.trim()) {
      const newProfile: PromptTemplate = {
        name: newProfileName.trim(),
        content: newProfileContent.trim(),
      }
      setPromptTemplates(prev => [...prev, newProfile])
      setModalView('list')
      setNewProfileName('')
      setNewProfileContent('')
    }
  }

  const handleSelectProfile = (profile: PromptTemplate) => {
    setActiveTemplate(profile)
    setIsPromptContextModalOpen(false)
  }

  const handleOpenEditView = (profile: PromptTemplate) => {
    setProfileToEdit(profile)
    setEditingProfileName(profile.name)
    setEditingProfileContent(profile.content)
    setModalView('edit')
  }

  const handleSaveChanges = () => {
    if (!profileToEdit) return
    setPromptTemplates(prev =>
      prev.map(p =>
        p.name === profileToEdit.name
          ? { ...p, name: editingProfileName, content: editingProfileContent }
          : p
      )
    )
    if (activeTemplate?.name === profileToEdit.name) {
      setActiveTemplate({ name: editingProfileName, content: editingProfileContent })
    }
    setModalView('list')
    setProfileToEdit(null)
  }

  const handleDeleteProfile = () => {
    if (!profileToEdit) return
    if (window.confirm(`Are you sure you want to delete "${profileToEdit.name}"?`)) {
      setPromptTemplates(prev => prev.filter(p => p.name !== profileToEdit.name))
      if (activeTemplate?.name === profileToEdit.name) {
        const remaining = promptTemplates.filter(p => p.name !== profileToEdit.name)
        setActiveTemplate(remaining.length > 0 ? remaining[0] : { name: '', content: '' })
      }
      setModalView('list')
      setProfileToEdit(null)
    }
  }

  const openSamplePromptsModal = (category: string) => {
    setSelectedPromptCategory(category)
    setIsSamplePromptsModalOpen(true)
    setIsSamplePromptsDropdownOpen(false)
  }

  // Toggle functions for context items
  const toggleCisaVulnerability = (vuln: CisaVulnerability) => {
    setContextVulnerabilities(prev => {
      const exists = prev.some(v => v.cveID === vuln.cveID)
      if (exists) {
        return prev.filter(v => v.cveID !== vuln.cveID)
      }
      return [...prev, vuln]
    })
  }

  const toggleNvdVulnerability = (vuln: NvdVulnerability) => {
    setContextNvdVulnerabilities(prev => {
      const exists = prev.some(v => v.cve.id === vuln.cve.id)
      if (exists) {
        return prev.filter(v => v.cve.id !== vuln.cve.id)
      }
      return [...prev, vuln]
    })
  }

  const toggleGreyNoiseItem = (item: GreyNoiseItem) => {
    setContextGreyNoiseItems(prev => {
      const exists = prev.some(i => i.guid === item.guid)
      if (exists) {
        return prev.filter(i => i.guid !== item.guid)
      }
      return [...prev, item]
    })
  }

  const toggleMitreTechnique = (technique: Technique) => {
    setContextMitreTechniques(prev => {
      const exists = prev.some(t => t.id === technique.id)
      if (exists) {
        return prev.filter(t => t.id !== technique.id)
      }
      return [...prev, technique]
    })
  }

  // Open data source popups
  const openDataSourcePopup = (source: string) => {
    setSelectedDataSource(source)
    switch (source) {
      case 'CISA KEV':
        setIsCisaKevPopupOpen(true)
        break
      case 'NVD':
        setIsNvdPopupOpen(true)
        break
      case 'GreyNoise':
        setIsGreyNoisePopupOpen(true)
        break
      case 'MITRE ATT&CK (ICS)':
        setIsMitreIcsModalOpen(true)
        break
      case 'MITRE ATT&CK (Enterprise)':
        setIsMitreEnterpriseModalOpen(true)
        break
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-full bg-slate-900">
      {/* Left Sidebar */}
      <aside className="w-72 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <span>sudo</span>
            <span className="flex flex-col ml-1 items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              <span className="flex gap-1 mt-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              </span>
            </span>
          </h1>
        </div>

        {/* Data Sources */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Data Sources</h2>
            <button className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded">
              <Plus size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => openDataSourcePopup('CISA KEV')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedDataSource === 'CISA KEV' || contextVulnerabilities.length > 0
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              CISA KEV {contextVulnerabilities.length > 0 && `(${contextVulnerabilities.length})`}
            </button>

            <button
              onClick={() => openDataSourcePopup('NVD')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedDataSource === 'NVD' || contextNvdVulnerabilities.length > 0
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              NVD {contextNvdVulnerabilities.length > 0 && `(${contextNvdVulnerabilities.length})`}
            </button>

            <button
              onClick={() => openDataSourcePopup('GreyNoise')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedDataSource === 'GreyNoise' || contextGreyNoiseItems.length > 0
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              GreyNoise {contextGreyNoiseItems.length > 0 && `(${contextGreyNoiseItems.length})`}
            </button>

            {/* MITRE ATT&CK Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMitreDropdownOpen(!isMitreDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  selectedDataSource?.includes('MITRE') || contextMitreTechniques.length > 0
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>MITRE ATT&CK {contextMitreTechniques.length > 0 && `(${contextMitreTechniques.length})`}</span>
                <ChevronDown size={16} className={`transition-transform ${isMitreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMitreDropdownOpen && (
                <div className="mt-1 bg-slate-700 rounded-md overflow-hidden">
                  <button
                    onClick={() => {
                      openDataSourcePopup('MITRE ATT&CK (ICS)')
                      setIsMitreDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-600"
                  >
                    ICS Matrix
                  </button>
                  <button
                    onClick={() => {
                      openDataSourcePopup('MITRE ATT&CK (Enterprise)')
                      setIsMitreDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-600"
                  >
                    Enterprise Matrix
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="text-center text-xs text-slate-500">
          AI Threat Intelligence
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-4">
          <button
            onClick={() => {
              setIsPromptContextModalOpen(true)
              setModalView('list')
            }}
            className="text-white hover:text-cyan-400 font-medium"
          >
            Prompt Context
          </button>
          <span className="text-slate-500">|</span>
          
          {/* Sample Prompts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSamplePromptsDropdownOpen(!isSamplePromptsDropdownOpen)}
              className="text-white hover:text-cyan-400 font-medium"
            >
              Sample Prompts
            </button>
            {isSamplePromptsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-slate-700 rounded-md shadow-lg z-50 min-w-[150px]">
                <button
                  onClick={() => openSamplePromptsModal('APTs')}
                  className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-600 rounded-t-md"
                >
                  APTs
                </button>
                <button
                  onClick={() => openSamplePromptsModal('HACKTIVISM')}
                  className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-600"
                >
                  HACKTIVISM
                </button>
                <button
                  onClick={() => openSamplePromptsModal('RANSOMWARE')}
                  className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-600 rounded-b-md"
                >
                  RANSOMWARE
                </button>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Right side controls */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure API Keys"
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded"
          >
            <KeyRound size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Square size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Settings size={18} />
          </button>
        </header>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-6 ${!hasMessages ? 'flex items-center justify-center' : ''}`}>
          {!hasMessages && !isLoading && (
            <div className="text-center">
              <p className="text-xl text-white mb-2">sudo</p>
              <p className="text-slate-400">SELECT * FROM DATA SOURCES TO ADD CONTEXT TO YOUR REPORT;</p>
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
        <div className="border-t border-slate-700 bg-slate-800 p-4">
          {/* AI Configurator */}
          <div className="mb-3">
            <AIConfigurator isLoading={isLoading} onStop={stop} />
          </div>

          {/* Context Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-700 text-slate-200 text-sm rounded-md hover:bg-slate-600"
            >
              Upload Template
            </button>

            {activeTemplate?.name && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full border border-purple-700">
                <FileText size={12} />
                {activeTemplate.name.substring(0, 20)}...
                <button onClick={removeTemplate} className="ml-1 hover:text-purple-100">
                  <X size={12} />
                </button>
              </span>
            )}

            {uploadedFileContexts.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded-full border border-emerald-700"
              >
                {file.name}
                <button onClick={() => removeFile(file.id)} className="ml-1 hover:text-emerald-100">
                  <X size={12} />
                </button>
              </span>
            ))}

            {contextVulnerabilities.map((vuln) => (
              <span
                key={vuln.cveID}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/50 text-red-300 text-xs rounded-full border border-red-700"
              >
                {vuln.cveID}
                <button
                  onClick={() => setContextVulnerabilities(prev => prev.filter(v => v.cveID !== vuln.cveID))}
                  className="ml-1 hover:text-red-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {contextNvdVulnerabilities.map((vuln) => (
              <span
                key={vuln.cve.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-900/50 text-orange-300 text-xs rounded-full border border-orange-700"
              >
                {vuln.cve.id}
                <button
                  onClick={() => setContextNvdVulnerabilities(prev => prev.filter(v => v.cve.id !== vuln.cve.id))}
                  className="ml-1 hover:text-orange-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {contextGreyNoiseItems.map((item) => (
              <span
                key={item.guid}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded-full border border-yellow-700"
              >
                {item.title.substring(0, 25)}...
                <button
                  onClick={() => setContextGreyNoiseItems(prev => prev.filter(i => i.guid !== item.guid))}
                  className="ml-1 hover:text-yellow-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {contextMitreTechniques.map((tech) => (
              <span
                key={tech.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-700"
              >
                {tech.id}: {tech.name}
                <button
                  onClick={() => setContextMitreTechniques(prev => prev.filter(t => t.id !== tech.id))}
                  className="ml-1 hover:text-blue-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={customSubmit} className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".txt,.md,.docx,.pdf"
              className="hidden"
            />

            <div className="flex-1">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Plan, search, build anything"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                rows={2}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    customSubmit(e as unknown as FormEvent<HTMLFormElement>)
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">∞ Agent</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg"
              >
                <Plus size={20} />
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Prompt Context Modal */}
      {isPromptContextModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {modalView === 'list' && 'Prompt Profiles'}
                {modalView === 'create' && 'Create New Profile'}
                {modalView === 'edit' && 'Edit Profile'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {modalView === 'list' && 'Select a profile to apply as the active system prompt.'}
                {modalView === 'create' && 'Create a new prompt profile.'}
                {modalView === 'edit' && 'Edit or delete this profile.'}
              </p>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {modalView === 'list' && (
                <div className="space-y-2">
                  {promptTemplates.map((profile, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer"
                      onClick={() => handleOpenEditView(profile)}
                    >
                      <span className="text-white font-medium">{profile.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectProfile(profile)
                          }}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded"
                        >
                          Select
                        </button>
                        <MoreVertical size={16} className="text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalView === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Profile Name</label>
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="e.g., Threat Intel Report Generator"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Prompt Content</label>
                    <textarea
                      value={newProfileContent}
                      onChange={(e) => setNewProfileContent(e.target.value)}
                      placeholder="Enter the prompt content..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white h-48"
                    />
                  </div>
                </div>
              )}

              {modalView === 'edit' && profileToEdit && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Profile Name</label>
                    <input
                      type="text"
                      value={editingProfileName}
                      onChange={(e) => setEditingProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Prompt Content</label>
                    <textarea
                      value={editingProfileContent}
                      onChange={(e) => setEditingProfileContent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white h-48"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between">
              {modalView === 'edit' && (
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
                >
                  Delete Profile
                </button>
              )}
              <div className={`flex gap-2 ${modalView !== 'edit' ? 'ml-auto' : ''}`}>
                {modalView === 'list' && (
                  <>
                    <button
                      onClick={() => setIsPromptContextModalOpen(false)}
                      className="px-4 py-2 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setModalView('create')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md flex items-center gap-2"
                    >
                      <Plus size={16} /> Create New Profile
                    </button>
                  </>
                )}
                {modalView === 'create' && (
                  <>
                    <button
                      onClick={() => setModalView('list')}
                      className="px-4 py-2 text-slate-300 hover:text-white"
                    >
                      Back to List
                    </button>
                    <button
                      onClick={handleAddNewProfile}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
                    >
                      Save Profile
                    </button>
                  </>
                )}
                {modalView === 'edit' && (
                  <>
                    <button
                      onClick={() => setModalView('list')}
                      className="px-4 py-2 text-slate-300 hover:text-white"
                    >
                      Back to List
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Prompts Modal */}
      {isSamplePromptsModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Sample Prompts: {selectedPromptCategory}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Example prompts for {selectedPromptCategory} analysis.
            </p>

            <div className="space-y-4 text-slate-200">
              {selectedPromptCategory === 'APTs' && (
                <ul className="list-disc pl-5 space-y-2">
                  <li>&quot;Analyze the TTPs associated with APT28 based on recent CISA alerts.&quot;</li>
                  <li>&quot;What are common C2 mechanisms used by FIN7?&quot;</li>
                  <li>&quot;Generate a summary of recent activity attributed to Lazarus Group targeting financial institutions.&quot;</li>
                </ul>
              )}
              {selectedPromptCategory === 'HACKTIVISM' && (
                <ul className="list-disc pl-5 space-y-2">
                  <li>&quot;Identify recent DDoS campaigns attributed to hacktivist groups targeting government websites.&quot;</li>
                  <li>&quot;What are the stated motivations and common targets of Anonymous in the last 6 months?&quot;</li>
                  <li>&quot;Summarize defacement techniques used by pro-Palestine hacktivist groups.&quot;</li>
                </ul>
              )}
              {selectedPromptCategory === 'RANSOMWARE' && (
                <ul className="list-disc pl-5 space-y-2">
                  <li>&quot;Provide a list of recent ransomware families and their primary infection vectors.&quot;</li>
                  <li>&quot;What are the latest IOCs for LockBit 3.0?&quot;</li>
                  <li>&quot;Generate a mitigation strategy for Conti ransomware attacks.&quot;</li>
                </ul>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500 italic">
              These prompts are examples. Modify them as needed for your specific query.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsSamplePromptsModalOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Popups */}
      <CisaKevPopup
        isOpen={isCisaKevPopupOpen}
        onOpenChange={setIsCisaKevPopupOpen}
        selectedVulnerabilitiesForContext={contextVulnerabilities}
        onToggleVulnerabilityForContext={toggleCisaVulnerability}
      />

      <NvdPopup
        isOpen={isNvdPopupOpen}
        onOpenChange={setIsNvdPopupOpen}
        selectedVulnerabilitiesForContext={contextNvdVulnerabilities}
        onToggleVulnerabilityForContext={toggleNvdVulnerability}
      />

      <GreyNoisePopup
        isOpen={isGreyNoisePopupOpen}
        onOpenChange={setIsGreyNoisePopupOpen}
        selectedItems={contextGreyNoiseItems}
        onToggleItem={toggleGreyNoiseItem}
      />

      <MitreAttackMatrixModal
        isOpen={isMitreIcsModalOpen}
        onOpenChange={setIsMitreIcsModalOpen}
        selectedTechniquesForContext={contextMitreTechniques}
        onToggleTechniqueForContext={toggleMitreTechnique}
      />

      <MitreEnterpriseMatrixModal
        isOpen={isMitreEnterpriseModalOpen}
        onOpenChange={setIsMitreEnterpriseModalOpen}
        selectedTechniquesForContext={contextMitreTechniques}
        onToggleTechniqueForContext={toggleMitreTechnique}
      />
    </div>
  )
}
