import { NextResponse } from 'next/server'

// This endpoint can be used to track failed email notifications
// You can set up monitoring to call this endpoint when emails fail

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, email, error, timestamp } = body

    // Log the failed email for manual follow-up
    console.error('🚨 FAILED EMAIL NOTIFICATION:', {
      orderId,
      customerEmail: email,
      error,
      timestamp: timestamp || new Date().toISOString(),
      requiresAction: true
    })

    // In a real system, you would:
    // 1. Store this in a database
    // 2. Send alert to admin
    // 3. Add to manual follow-up queue
    // 4. Send Slack/Discord notification
    // 5. Create support ticket

    // For now, we'll just log it prominently
    const alertMessage = `
🚨 URGENT: EMAIL NOTIFICATION FAILED 🚨
Order ID: ${orderId}
Customer Email: ${email}
Error: ${error}
Time: ${timestamp || new Date().toISOString()}

ACTION REQUIRED: Manually send order confirmation to customer
`

    console.error(alertMessage)

    return NextResponse.json({
      success: true,
      message: 'Failed email logged for manual follow-up',
      orderId,
      requiresManualAction: true
    })
  } catch (error: any) {
    console.error('Failed to log email failure:', error)
    return NextResponse.json(
      { error: 'Failed to log email failure' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // This could return a list of failed emails for admin dashboard
  return NextResponse.json({
    message: 'Failed emails tracking endpoint',
    usage: 'POST to log failed emails, implement admin dashboard here'
  })
}