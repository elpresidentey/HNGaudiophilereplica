import { NextResponse } from 'next/server'
import { emailService } from '@/lib/emailService'

export async function GET() {
  const status = emailService.getStatus()
  
  const response = {
    ...status,
    message: status.configured 
      ? '✅ Email service is fully configured and ready' 
      : '🚨 CRITICAL: No email providers configured - customer notifications will fail!',
    severity: status.configured ? 'success' : 'critical',
    instructions: status.configured 
      ? 'Email notifications are working!' 
      : 'URGENT: Add RESEND_API_KEY environment variable immediately',
    testUrl: '/test-email',
    setupGuide: '/RESEND_SETUP_GUIDE.md'
  }
  
  return NextResponse.json(response)
}