import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const createMockServerClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    signUp: () => Promise.resolve({ data: null, error: { message: "Demo mode - Supabase not configured" } }),
    signOut: () => Promise.resolve({ error: null }),
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

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    console.warn("[v0] Supabase not configured on server. Running in demo mode.")
    return createMockServerClient() as any
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    console.error("[v0] Failed to create server Supabase client:", error)
    return createMockServerClient() as any
  }
}
