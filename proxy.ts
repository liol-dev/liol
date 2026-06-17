import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// PROXY — protects /admin routes server-side
// (Next.js 16 renamed the old `middleware` convention to `proxy`;
//  same behavior, runs on every request matching the matcher.)
//
// If the user has no valid Supabase session, they get
// redirected to /admin/login before any page code runs.
// This replaces the old client-side AdminGate stub.
// ============================================================

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — keeps the token alive on active use
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Let /admin/login through always (otherwise redirect loop)
  if (pathname === '/admin/login') {
    // If already signed in, send them to dashboard
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return supabaseResponse
  }

  // All other /admin/* routes require a session
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
