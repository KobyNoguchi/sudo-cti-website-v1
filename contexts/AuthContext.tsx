'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  trackActivity: (type: 'page_visit' | 'report_download', data?: { page_path?: string; report_name?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Track login/logout events
        if (event === 'SIGNED_IN' && session?.user) {
          await logActivity('login', session.user.id, session.user.email || '')
        } else if (event === 'SIGNED_OUT') {
          // Note: We track logout before the user is cleared
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Track page visits
  useEffect(() => {
    if (user && pathname) {
      trackActivity('page_visit', { page_path: pathname })
    }
  }, [pathname, user])

  const logActivity = async (
    type: 'login' | 'logout' | 'page_visit' | 'report_download',
    userId: string,
    userEmail: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      await supabase.from('user_activity').insert({
        user_id: userId,
        user_email: userEmail,
        activity_type: type,
        page_path: metadata?.page_path,
        report_name: metadata?.report_name,
        metadata
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    if (user) {
      await logActivity('logout', user.id, user.email || '')
    }
    await supabase.auth.signOut()
  }

  const trackActivity = async (
    type: 'page_visit' | 'report_download',
    data?: { page_path?: string; report_name?: string }
  ) => {
    if (!user) return
    await logActivity(type, user.id, user.email || '', data)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, trackActivity }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


