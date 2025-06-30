import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow WhatsApp webhook endpoints to bypass authentication
  if (request.nextUrl.pathname === '/api/whatsapp' || 
      request.nextUrl.pathname === '/api/whatsapp-mcp' ||
      request.nextUrl.pathname === '/api/webhook') {
    // Add headers to indicate this should bypass authentication
    const response = NextResponse.next()
    response.headers.set('x-vercel-skip-protection', '1')
    response.headers.set('x-middleware-override-headers', 'x-vercel-protection-bypass')
    response.headers.set('x-vercel-protection-bypass', '1')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/whatsapp', '/api/whatsapp-mcp', '/api/webhook']
} 