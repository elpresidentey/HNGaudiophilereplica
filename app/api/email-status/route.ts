import { NextResponse } from 'next/server'

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY
  
  return NextResponse.json({
    configured: hasResendKey,
    message: hasResendKey 
      ? 'Email service is configured' 
      : 'Email service is not configured - orders will still be processed'
  })
}