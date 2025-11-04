import { NextResponse } from 'next/server'
import { emailService } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    // Validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      )
    }

    const { email, name, orderId, items, total, shipping, subtotal, tax, address, city, country, zipCode } = body

    // Validate required fields
    if (!email || !name || !orderId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, orderId, and items are required' }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' }, 
        { status: 400 }
      )
    }

    // Validate items array
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' }, 
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: 'Invalid order total' }, 
        { status: 400 }
      )
    }

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}x
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Cabin', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #101010; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">audiophile</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #101010; margin: 0 0 20px 0; font-size: 24px;">Hi ${name},</h2>
                      <p style="color: #4C4C4C; margin: 0 0 20px 0; font-size: 15px; line-height: 25px;">
                        Thank you for your order! We've received your order and will begin processing it right away.
                      </p>
                      
                      <div style="background-color: #F1F1F1; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0 0 10px 0; color: #101010; font-weight: 600;">Order ID: ${orderId}</p>
                      </div>
                      
                      <h3 style="color: #101010; margin: 30px 0 15px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1.3px;">Order Summary</h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
                        <thead>
                          <tr style="background-color: #F1F1F1;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: #101010;">Item</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600; color: #101010;">Qty</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: #101010;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                          <td style="padding: 8px 0; color: #4C4C4C;">Subtotal</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">$${subtotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #4C4C4C;">Shipping</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">$${shipping.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #4C4C4C;">Tax</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #101010;">$${tax.toLocaleString()}</td>
                        </tr>
                        <tr style="border-top: 2px solid #101010;">
                          <td style="padding: 12px 0; font-weight: 600; color: #101010; font-size: 18px;">Total</td>
                          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #101010; font-size: 18px;">$${total.toLocaleString()}</td>
                        </tr>
                      </table>
                      
                      <h3 style="color: #101010; margin: 30px 0 15px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1.3px;">Shipping Address</h3>
                      <p style="color: #4C4C4C; margin: 0 0 5px 0; font-size: 15px; line-height: 25px;">
                        ${address}<br>
                        ${city}, ${zipCode}<br>
                        ${country}
                      </p>
                      
                      <div style="margin: 40px 0; text-align: center;">
                        <p style="color: #4C4C4C; margin: 0; font-size: 13px;">
                          Your order is being processed and will be shipped soon.
                        </p>
                      </div>
                      
                      <p style="color: #4C4C4C; margin: 30px 0 0 0; font-size: 13px; line-height: 20px;">
                        If you have any questions about your order, please contact us at <a href="mailto:support@audiophile.com" style="color: #D87D4A;">support@audiophile.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #101010; padding: 40px; text-align: center; color: #ffffff;">
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #ffffff;">Copyright 2021. All Rights Reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    // Prepare email data
    const emailData = {
      to: email,
      subject: `🎧 Order Confirmation - ${orderId}`,
      html: emailHtml,
    }

    // Try to send email with robust fallback system
    const result = await emailService.sendEmail(emailData)

    if (result.success) {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const redirectDevEmails = process.env.REDIRECT_DEV_EMAILS === 'true'
      const verifiedEmail = 'conceptsandcontexts@gmail.com'
      
      let message = `✅ Confirmation email sent successfully via ${result.provider}`
      let actualRecipient = email
      
      // Only show redirection message if actually redirecting
      if (isDevelopment && redirectDevEmails && email !== verifiedEmail) {
        message += ` (redirected to ${verifiedEmail} in development mode)`
        actualRecipient = verifiedEmail
      }
      
      return NextResponse.json({ 
        success: true, 
        provider: result.provider,
        messageId: result.messageId,
        message,
        developmentMode: isDevelopment,
        redirectionActive: redirectDevEmails,
        originalRecipient: email,
        actualRecipient: actualRecipient
      })
    } else {
      // Email failed but don't block the checkout - log for manual follow-up
      console.error('🚨 CRITICAL: Email sending failed completely:', result.error)
      
      return NextResponse.json({ 
        success: false,
        provider: result.provider,
        error: result.error,
        message: 'Email delivery failed - manual follow-up required',
        requiresManualFollowup: true
      }, { status: 200 }) // Return 200 so checkout doesn't fail
    }
  } catch (error: any) {
    console.error('🚨 CRITICAL EMAIL API ERROR:', error)
    
    // Log error but don't block checkout
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Email system failure - order processed successfully',
      requiresManualFollowup: true,
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 so checkout completes
  }
}