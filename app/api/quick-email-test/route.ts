import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment
    const hasApiKey = !!process.env.RESEND_API_KEY
    const apiKeyFormat = process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    
    if (!hasApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables',
        environment: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL
      })
    }

    // Try to import and use Resend
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Simple test email
    const result = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: 'test@example.com', // This will fail but show us the error
      subject: 'Quick Test',
      html: '<p>Test email</p>'
    })

    return NextResponse.json({
      success: !result.error,
      apiKeyFound: hasApiKey,
      apiKeyFormat,
      environment: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      result: result.error ? result.error.message : 'Success',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyFound: !!process.env.RESEND_API_KEY,
      environment: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString()
    })
  }
}