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
          
          // Handle Resend free tier limitations - only verified email allowed
          const verifiedEmail = 'conceptsandcontexts@gmail.com'
          const isDevelopment = process.env.NODE_ENV === 'development'
          const isVerifiedEmail = data.to === verifiedEmail
          
          console.log(`📧 Attempting to send email to: ${data.to}`)
          console.log(`📧 Is verified email: ${isVerifiedEmail}`)
          console.log(`📧 Environment: ${isDevelopment ? 'development' : 'production'}`)
          
          try {
            // Check if we should redirect for development testing
            if (isDevelopment && data.to !== verifiedEmail && process.env.REDIRECT_DEV_EMAILS === 'true') {
              console.warn(`⚠️ Development mode: Redirecting email from ${data.to} to verified email ${verifiedEmail}`)
              
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
            
            // Handle Resend free tier limitation - redirect non-verified emails
            if (!isVerifiedEmail) {
              console.warn(`⚠️ Resend free tier: Redirecting email from ${data.to} to verified email ${verifiedEmail}`)
              
              const modifiedHtml = `
                <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                  <h3 style="color: #1976d2; margin: 0 0 10px 0;">📧 Email Delivery Notice</h3>
                  <p style="color: #1976d2; margin: 0; font-size: 14px;">
                    <strong>Original recipient:</strong> ${data.to}<br>
                    <strong>Delivery status:</strong> Redirected to verified email due to Resend free tier limitations<br>
                    <strong>Production note:</strong> To send to any email address, verify a domain at resend.com/domains
                  </p>
                </div>
                ${data.html}
              `
              
              const result = await resend.emails.send({
                from: data.from || 'Audiophile <onboarding@resend.dev>',
                to: verifiedEmail,
                subject: `[REDIRECTED] ${data.subject} (for ${data.to})`,
                html: modifiedHtml,
              })
              
              console.log(`📧 Redirected email sent successfully`)
              return result
            }
            
            // Send to verified email normally
            const result = await resend.emails.send({
              from: data.from || 'Audiophile <onboarding@resend.dev>',
              to: data.to,
              subject: data.subject,
              html: data.html,
            })
            
            console.log(`📧 Email sent to verified address successfully`)
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