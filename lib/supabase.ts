import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create supabase client or a mock for build time
function createSupabaseClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // During build or when env vars are missing, return a mock client
  // This prevents build failures while still allowing the app to compile
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_callback: unknown) => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Supabase not configured. Please add environment variables.') 
    }),
    signOut: () => Promise.resolve({ error: null }),
  }

  const mockFrom = () => ({
    insert: () => Promise.resolve({ data: null, error: null }),
    select: () => Promise.resolve({ data: [], error: null }),
  })

  // Return mock client - cast to SupabaseClient for type compatibility
  return {
    auth: mockAuth,
    from: mockFrom,
  } as unknown as SupabaseClient
}

export const supabase = createSupabaseClient()

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Types for our database
export interface UserActivity {
  id: string
  user_id: string
  user_email: string
  activity_type: 'login' | 'logout' | 'page_visit' | 'report_download'
  page_path?: string
  report_name?: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  last_login?: string
}
