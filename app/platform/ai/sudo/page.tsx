'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SudoChat from '@/components/sudo-ai/SudoChat'
import ApiKeyModal from '@/components/auth/ApiKeyModal'

export default function SudoAIPage() {
  const { user, loading, anthropicApiKey } = useAuth()
  const router = useRouter()
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Auto-open modal when logged in but no key configured
  useEffect(() => {
    if (!loading && user && anthropicApiKey === null) {
      setIsApiKeyModalOpen(true)
    }
  }, [loading, user, anthropicApiKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="h-[calc(100vh-5rem)]">
        <SudoChat onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      </div>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  )
}
