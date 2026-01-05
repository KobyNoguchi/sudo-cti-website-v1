'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { AIConfigProvider } from '@/contexts/AIConfigContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AIConfigProvider>
        {children}
      </AIConfigProvider>
    </AuthProvider>
  )
}
