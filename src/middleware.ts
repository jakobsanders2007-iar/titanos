import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public paths that never require auth. `/health` is here so uptime/status
// checks are always reachable, even when auth is enforced.
function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/health') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/seed') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  )
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // DEMO MODE: if Supabase isn't configured, do NOT construct a client (it
  // throws) and do NOT enforce auth. This keeps the marketing site + demo fully
  // functional on a fresh Vercel deploy with no env vars — instead of returning
  // 500 on every route because middleware crashed.
  if (!url || !anonKey) {
    return NextResponse.next({ request })
  }

  // CONNECTED MODE: enforce auth. Wrapped so a transient Supabase/edge error
  // never takes the entire site down — worst case we fall through to the request.
  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // Refresh session — do not remove this
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    if (!isPublicPath(pathname) && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect logged-in users away from login
    if (pathname === '/login' && user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/command'
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (err) {
    // Never 500 the whole site from an auth check. Log and let the request
    // through; downstream pages degrade to demo mode / inline error states.
    console.error('[middleware] auth refresh failed, passing through:', err instanceof Error ? err.message : err)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
