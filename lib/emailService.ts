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
          return await resend.emails.send({
            from: data.from || 'Audiophile <onboarding@resend.dev>',
            to: data.to,
            subject: data.subject,
            html: data.html,
          })
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
        return {
          success: true,
          provider: provider.name,
          messageId: result.data?.id || result.id || 'unknown'
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