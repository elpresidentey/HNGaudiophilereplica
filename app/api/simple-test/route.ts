import { NextResponse } from 'next/server'

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
    apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 5) || 'none'
  }

  // If no API key, return immediately
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      ...debug,
      error: 'No RESEND_API_KEY found',
      solution: 'Add RESEND_API_KEY environment variable'
    })
  }

  // Try basic Resend test
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test with a real email address
    const result = await resend.emails.send({
      from: 'Audiophile <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // Resend's test email
      subject: 'Test Email - ' + new Date().toLocaleString(),
      html: '<h1>Test Email</h1><p>If you see this, email is working!</p>'
    })

    return NextResponse.json({
      ...debug,
      success: !result.error,
      result: result.error ? {
        name: result.error.name,
        message: result.error.message
      } : {
        id: result.data?.id,
        message: 'Email sent successfully'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      ...debug,
      success: false,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'Audiophile Test <onboarding@resend.dev>',
      to: email,
      subject: 'Test Email from Audiophile - ' + new Date().toLocaleString(),
      html: `
        <h1>🎧 Test Email Successful!</h1>
        <p>This email was sent from your Audiophile e-commerce site.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> Email system is working correctly!</p>
      `
    })

    return NextResponse.json({
      success: !result.error,
      result: result.error ? result.error.message : `Email sent with ID: ${result.data?.id}`
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}