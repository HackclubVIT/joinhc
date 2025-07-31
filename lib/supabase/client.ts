import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false, // Must be false for client-side
        sameSite: 'lax',
        path: '/',
      }
    }
  )
}
