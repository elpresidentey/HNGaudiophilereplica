// Multi-provider email service with robust fallbacks
import { Resend } from 'resend'

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export interface EmailResult {
  success: boolean
  provider: string
  messageId?: string
  error?: string
}

class EmailService {
  private providers: Array<{
    name: string
    enabled: boolean
    send: (data: EmailData) => Promise<any>
  }> = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Resend provider
    if (process.env.RESEND_API_KEY) {
      this.providers.push({
        name: 'resend',
        enabled: true,
        send: async (data: EmailData) => {
          const resend = new Resend(process.env.RESEND_API_KEY)
          
          // Send email to any address in production
          // In development, we can still redirect for testing if needed
          const isDevelopment = process.env.NODE_ENV === 'development'
          const verifiedEmail = 'conceptsandcontexts@gmail.com'
          
          // Only redirect in development mode for testing purposes
          if (isDevelopment && data.to !== verifiedEmail && process.env.REDIRECT_DEV_EMAILS === 'true') {
            console.warn(`⚠️ Development mode: Redirecting email from ${data.to} to verified email ${verifiedEmail}`)
            console.log(`📧 Original recipient: ${data.to}`)
            console.log(`📧 Email subject: ${data.subject}`)
            
            // Modify the email content to show original recipient
            const modifiedHtml = `
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">🚧 Development Mode Notice</h3>
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  This email was originally intended for: <strong>${data.to}</strong><br>
                  In production, it will be sent to the actual customer email.
                </p>
              </div>
              ${data.html}
            `
            
            return await resend.emails.send({
              from: data.from || 'Audiophile <onboarding@resend.dev>',
              to: verifiedEmail,
              subject: `[DEV] ${data.subject} (for ${data.to})`,
              html: modifiedHtml,
            })
          }
          
          // Send to actual recipient - with detailed error handling
          console.log(`📧 Attempting to send email to: ${data.to}`)
          console.log(`📧 From: ${data.from || 'Audiophile <onboarding@resend.dev>'}`)
          
          try {
            const result = await resend.emails.send({
              from: data.from || 'Audiophile <onboarding@resend.dev>',
              to: data.to,
              subject: data.subject,
              html: data.html,
            })
            
            console.log(`📧 Resend API Response:`, JSON.stringify(result, null, 2))
            
            // Check if there's an error in the response
            if (result.error) {
              console.error(`❌ Resend API Error:`, result.error)
              throw new Error(`Resend API Error: ${result.error.message || JSON.stringify(result.error)}`)
            }
            
            return result
          } catch (error: any) {
            console.error(`❌ Resend send failed:`, error)
            console.error(`❌ Error details:`, JSON.stringify(error, null, 2))
            throw error
          }
        }
      })
    }

    // Nodemailer with Gmail (backup option)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      this.providers.push({
        name: 'gmail',
        enabled: true,
        send: async (data: EmailData) => {
          // This would use nodemailer - simplified for now
          throw new Error('Gmail provider not implemented yet')
        }
      })
    }

    // SendGrid (another backup option)
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push({
        name: 'sendgrid',
        enabled: true,
        send: async (data: EmailData) => {
          // This would use SendGrid - simplified for now
          throw new Error('SendGrid provider not implemented yet')
        }
      })
    }
  }

  async sendEmail(data: EmailData): Promise<EmailResult> {
    const errors: string[] = []

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.enabled) continue

      try {
        console.log(`Attempting to send email via ${provider.name}...`)
        const result = await provider.send(data)
        
        console.log(`✅ Email sent successfully via ${provider.name}`)
        console.log('📧 Email result:', result)
        return {
          success: true,
          provider: provider.name,
          messageId: result.data?.id || result.id || result.messageId || 'sent-successfully'
        }
      } catch (error: any) {
        const errorMsg = `${provider.name}: ${error.message}`
        errors.push(errorMsg)
        console.warn(`❌ ${provider.name} failed:`, error.message)
      }
    }

    // All providers failed
    console.error('🚨 ALL EMAIL PROVIDERS FAILED:', errors)
    return {
      success: false,
      provider: 'none',
      error: errors.join('; ')
    }
  }

  getStatus() {
    return {
      availableProviders: this.providers.length,
      providers: this.providers.map(p => ({
        name: p.name,
        enabled: p.enabled
      })),
      configured: this.providers.length > 0
    }
  }
}

export const emailService = new EmailService()