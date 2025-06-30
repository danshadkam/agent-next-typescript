import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow WhatsApp webhook endpoint to bypass authentication
  if (request.nextUrl.pathname === '/api/whatsapp') {
    // Add headers to indicate this should bypass authentication
    const response = NextResponse.next()
    response.headers.set('x-vercel-skip-protection', '1')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/whatsapp']
} 