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

      // Step 4: Send test email directly with Resend to see actual response
      console.log(`🧪 Testing email to: ${testEmail}`)
      
      try {
        const directResult = await resend.emails.send({
          from: 'Audiophile Test <onboarding@resend.dev>',
          to: testEmail,
          subject: 'Direct Test Email - ' + new Date().toLocaleString(),
          html: `
            <h1>Direct Test Email!</h1>
            <p>This is a direct test email sent at ${new Date().toLocaleString()}</p>
            <p><strong>Recipient:</strong> ${testEmail}</p>
            <p>If you receive this, the email system is working correctly.</p>
          `
        })
        
        console.log(`🧪 Direct Resend Response:`, JSON.stringify(directResult, null, 2))
        
        testResult.steps.push({
          step: 4,
          name: 'Direct Email Send',
          success: !directResult.error,
          details: directResult.error ? 
            `Resend Error: ${directResult.error.message || JSON.stringify(directResult.error)}` :
            `Email sent with ID: ${directResult.data?.id || 'unknown'}`
        })
        
        // Also test with email service
        const { emailService } = await import('@/lib/emailService')
        const serviceResult = await emailService.sendEmail({
          to: testEmail,
          subject: 'Service Test Email - ' + new Date().toLocaleString(),
          html: `
            <h1>Service Test Email!</h1>
            <p>This is a service test email sent at ${new Date().toLocaleString()}</p>
            <p><strong>Recipient:</strong> ${testEmail}</p>
          `
        })
        
        testResult.steps.push({
          step: 5,
          name: 'Email Service Send',
          success: serviceResult.success,
          details: serviceResult.success ? 
            `Service sent via ${serviceResult.provider} with ID: ${serviceResult.messageId}` : 
            `Service error: ${serviceResult.error}`
        })

        return NextResponse.json({
          ...testResult,
          success: !directResult.error && serviceResult.success,
          directResult: {
            success: !directResult.error,
            emailId: directResult.data?.id,
            error: directResult.error
          },
          serviceResult: serviceResult
        })
        
      } catch (directError: any) {
        console.error(`🧪 Direct send failed:`, directError)
        
        testResult.steps.push({
          step: 4,
          name: 'Direct Email Send',
          success: false,
          details: `Direct send failed: ${directError.message}`
        })
        
        return NextResponse.json({
          ...testResult,
          success: false,
          error: directError.message
        })
      }

      testResult.steps.push({
        step: 4,
        name: 'Email Send',
        success: emailResult.success,
        details: emailResult.success ? 
          `Email sent via ${emailResult.provider} with ID: ${emailResult.messageId}` : 
          emailResult.error
      })

      return NextResponse.json({
        ...testResult,
        success: emailResult.success,
        emailId: emailResult.messageId,
        provider: emailResult.provider,
        error: emailResult.error
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