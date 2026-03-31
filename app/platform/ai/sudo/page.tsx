'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import SudoChat from '@/components/sudo-ai/SudoChat'
import ApiKeyModal from '@/components/auth/ApiKeyModal'

export default function SudoAIPage() {
  const { user, loading, anthropicApiKey } = useAuth()
  const router = useRouter()
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const hasCheckedKey = useRef(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Auto-open modal once when user is loaded and has no key
  // Use a ref to only trigger once per session, not on every re-render
  useEffect(() => {
    if (!loading && user && !hasCheckedKey.current) {
      hasCheckedKey.current = true
      // Small delay to allow localStorage to hydrate into state
      const timer = setTimeout(() => {
        if (!anthropicApiKey) {
          setIsApiKeyModalOpen(true)
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [loading, user])

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
