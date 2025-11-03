import { Resend } from 'resend'
import { NextResponse } from 'next/server'

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
                        <a href="#" style="display: inline-block; background-color: #D87D4A; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
                          View Your Order
                        </a>
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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not properly configured' }, 
        { status: 503 }
      )
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'Audiophile <onboarding@resend.dev>',
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend API error:', error)
      
      // Handle specific Resend errors
      if (error.message?.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Email service rate limit exceeded. Please try again in a few minutes.' }, 
          { status: 429 }
        )
      }
      
      if (error.message?.includes('invalid email')) {
        return NextResponse.json(
          { error: 'Invalid email address provided' }, 
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to send confirmation email' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Confirmation email sent successfully' 
    })
  } catch (error: any) {
    console.error('Email API error:', error)
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Network error while sending email' }, 
        { status: 503 }
      )
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Email service is temporarily unavailable' }, 
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending email' }, 
      { status: 500 }
    )
  }
}

