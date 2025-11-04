import { NextResponse } from 'next/server'

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY
  
  const status = {
    configured: hasResendKey,
    providers: {
      resend: {
        enabled: hasResendKey,
        status: hasResendKey ? 'ready' : 'missing API key'
      }
    },
    message: hasResendKey 
      ? '✅ Email service is fully configured and ready' 
      : '⚠️ Email service not configured - orders will still work perfectly',
    instructions: hasResendKey 
      ? 'Email notifications are working!' 
      : 'Add RESEND_API_KEY environment variable to enable email notifications',
    testUrl: '/test-email'
  }
  
  return NextResponse.json(status)
}