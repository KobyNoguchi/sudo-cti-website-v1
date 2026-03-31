'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  anthropicApiKey: string | null
  openAiApiKey: string | null
  setAnthropicApiKey: (key: string) => Promise<void>
  setOpenAiApiKey: (key: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  trackActivity: (type: 'page_visit' | 'report_download', data?: { page_path?: string; report_name?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const lsAnthropicKey = (userId: string) => `sudo_anthropic_key_${userId}`
const lsOpenAiKey = (userId: string) => `sudo_openai_key_${userId}`

function loadKeysFromStorage(userId: string) {
  try {
    return {
      anthropic: localStorage.getItem(lsAnthropicKey(userId)),
      openai: localStorage.getItem(lsOpenAiKey(userId)),
    }
  } catch {
    return { anthropic: null, openai: null }
  }
}

function saveKeyToStorage(storageKey: string, value: string) {
  try { localStorage.setItem(storageKey, value) } catch {}
}

function clearKeysFromStorage(userId: string) {
  try {
    localStorage.removeItem(lsAnthropicKey(userId))
    localStorage.removeItem(lsOpenAiKey(userId))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [anthropicApiKey, setAnthropicApiKeyState] = useState<string | null>(null)
  const [openAiApiKey, setOpenAiApiKeyState] = useState<string | null>(null)
  const pathname = usePathname()

  const loadUserSettings = (userId: string) => {
    // Load from localStorage immediately (synchronous)
    const { anthropic, openai } = loadKeysFromStorage(userId)
    if (anthropic) setAnthropicApiKeyState(anthropic)
    if (openai) setOpenAiApiKeyState(openai)

    // Also try Supabase in background — if it has data, prefer it and sync to localStorage
    supabase
      .from('user_settings')
      .select('anthropic_api_key, openai_api_key')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.anthropic_api_key) {
          setAnthropicApiKeyState(data.anthropic_api_key)
          saveKeyToStorage(lsAnthropicKey(userId), data.anthropic_api_key)
        }
        if (data?.openai_api_key) {
          setOpenAiApiKeyState(data.openai_api_key)
          saveKeyToStorage(lsOpenAiKey(userId), data.openai_api_key)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserSettings(session.user.id)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
      .finally(() => {
        clearTimeout(loadingTimeout)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          await logActivity('login', session.user.id, session.user.email || '')
          loadUserSettings(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          if (user) clearKeysFromStorage(user.id)
          setAnthropicApiKeyState(null)
          setOpenAiApiKeyState(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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

  const setAnthropicApiKey = async (key: string) => {
    if (!user) return
    setAnthropicApiKeyState(key)
    saveKeyToStorage(lsAnthropicKey(user.id), key)
    // Background sync to Supabase
    supabase.from('user_settings').upsert({
      user_id: user.id,
      anthropic_api_key: key,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.error('Failed to sync Anthropic key to Supabase:', error)
    })
  }

  const setOpenAiApiKey = async (key: string) => {
    if (!user) return
    setOpenAiApiKeyState(key)
    saveKeyToStorage(lsOpenAiKey(user.id), key)
    // Background sync to Supabase
    supabase.from('user_settings').upsert({
      user_id: user.id,
      openai_api_key: key,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.error('Failed to sync OpenAI key to Supabase:', error)
    })
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
      clearKeysFromStorage(user.id)
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
    <AuthContext.Provider value={{
      user, session, loading,
      anthropicApiKey, openAiApiKey,
      setAnthropicApiKey, setOpenAiApiKey,
      signIn, signOut, trackActivity
    }}>
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
