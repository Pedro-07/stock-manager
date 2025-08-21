import { createBrowserClient } from "@supabase/ssr"

const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    signUp: () => Promise.resolve({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    update: () => ({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    delete: () => ({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    eq: function () {
      return this
    },
    order: function () {
      return this
    },
    limit: function () {
      return this
    },
    single: function () {
      return this
    },
  }),
})

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    console.warn("[v0] Supabase not configured. Running in demo mode.")
    return createMockClient() as any
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return createMockClient() as any
  }
}
