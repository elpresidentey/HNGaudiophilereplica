import { NextResponse } from 'next/server'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      resendApiKey: {
        exists: !!process.env.RESEND_API_KEY,
        format: process.env.RESEND_API_KEY ? 
          (process.env.RESEND_API_KEY.startsWith('re_') ? 'valid' : 'invalid format') : 
          'missing',
        length: process.env.RESEND_API_KEY?.length || 0
      },
      environmentVariables: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        VERCEL: process.env.VERCEL ? 'true' : 'false'
      }
    },
    commonIssues: [
      {
        issue: 'Missing API Key',
        check: !process.env.RESEND_API_KEY,
        solution: 'Add RESEND_API_KEY environment variable in Vercel dashboard'
      },
      {
        issue: 'Invalid API Key Format',
        check: process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_'),
        solution: 'API key should start with "re_" - get a new one from resend.com'
      },
      {
        issue: 'Development vs Production',
        check: process.env.NODE_ENV !== 'production',
        solution: 'Make sure environment variables are set for production in Vercel'
      }
    ],
    nextSteps: []
  }

  // Add specific next steps based on issues found
  diagnostics.commonIssues.forEach(issue => {
    if (issue.check) {
      diagnostics.nextSteps.push(issue.solution)
    }
  })

  if (diagnostics.nextSteps.length === 0) {
    diagnostics.nextSteps.push('Configuration looks good - test with /test-email')
  }

  return NextResponse.json(diagnostics)
}

export async function POST(request: Request) {
  try {
    const { testEmail } = await request.json()
    
    // Test email sending with detailed error reporting
    const testResult = {
      timestamp: new Date().toISOString(),
      testEmail,
      steps: []
    }

    // Step 1: Check API key
    testResult.steps.push({
      step: 1,
      name: 'API Key Check',
      success: !!process.env.RESEND_API_KEY,
      details: process.env.RESEND_API_KEY ? 'API key found' : 'API key missing'
    })

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        ...testResult,
        success: false,
        error: 'RESEND_API_KEY environment variable is not set'
      })
    }

    // Step 2: Try to import Resend
    try {
      const { Resend } = await import('resend')
      testResult.steps.push({
        step: 2,
        name: 'Resend Import',
        success: true,
        details: 'Resend library imported successfully'
      })

      // Step 3: Initialize Resend
      const resend = new Resend(process.env.RESEND_API_KEY)
      testResult.steps.push({
        step: 3,
        name: 'Resend Initialization',
        success: true,
        details: 'Resend client initialized'
      })

      // Step 4: Send test email
      const emailResult = await resend.emails.send({
        from: 'Audiophile Test <onboarding@resend.dev>',
        to: testEmail,
        subject: 'Test Email - ' + new Date().toLocaleString(),
        html: `
          <h1>Test Email Successful!</h1>
          <p>This is a test email sent at ${new Date().toLocaleString()}</p>
          <p>Your email system is working correctly.</p>
        `
      })

      testResult.steps.push({
        step: 4,
        name: 'Email Send',
        success: !emailResult.error,
        details: emailResult.error ? emailResult.error.message : `Email sent with ID: ${emailResult.data?.id}`
      })

      return NextResponse.json({
        ...testResult,
        success: !emailResult.error,
        emailId: emailResult.data?.id,
        error: emailResult.error?.message
      })

    } catch (importError: any) {
      testResult.steps.push({
        step: 2,
        name: 'Resend Import',
        success: false,
        details: importError.message
      })

      return NextResponse.json({
        ...testResult,
        success: false,
        error: `Failed to import Resend: ${importError.message}`
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}