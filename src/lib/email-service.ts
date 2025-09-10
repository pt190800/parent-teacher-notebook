import { createClient } from '@/lib/supabase/client'
import { DailyNote, User } from '@/types'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private supabase = createClient()

  private generateNewNoteEmailTemplate(note: DailyNote, parent: User): EmailTemplate {
    const studentName = `${note.student?.first_name} ${note.student?.last_name}`
    const teacherName = `${note.teacher?.first_name} ${note.teacher?.last_name}`
    const noteDate = new Date(note.note_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const subject = `New Daily Note for ${studentName} - ${noteDate}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Daily Note</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .note-card { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .note-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .note-meta { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
            .note-content { white-space: pre-wrap; margin-bottom: 20px; }
            .attachments { margin-top: 15px; }
            .attachment-item { background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; margin: 5px 0; display: inline-block; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Daily Note Available</h1>
              <p>Hello ${parent.first_name},</p>
              <p>A new daily note has been posted for ${studentName}.</p>
            </div>
            
            <div class="content">
              <div class="note-card">
                <div class="note-title">${note.title || 'Daily Note'}</div>
                <div class="note-meta">
                  <strong>Date:</strong> ${noteDate}<br>
                  <strong>Teacher:</strong> ${teacherName}<br>
                  <strong>Class:</strong> ${note.student?.class?.name || 'N/A'}
                </div>
                <div class="note-content">${note.content}</div>
                
                ${note.attachments && note.attachments.length > 0 ? `
                  <div class="attachments">
                    <strong>Attachments:</strong><br>
                    ${note.attachments.map(att => 
                      `<div class="attachment-item">📎 ${att.file_name}</div>`
                    ).join('')}
                  </div>
                ` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent" class="button">
                  View Full Note
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the Parent-Teacher Communication System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      New Daily Note for ${studentName} - ${noteDate}
      
      Hello ${parent.first_name},
      
      A new daily note has been posted for ${studentName}.
      
      Note: ${note.title || 'Daily Note'}
      Date: ${noteDate}
      Teacher: ${teacherName}
      Class: ${note.student?.class?.name || 'N/A'}
      
      Content:
      ${note.content}
      
      ${note.attachments && note.attachments.length > 0 ? `
      Attachments:
      ${note.attachments.map(att => `- ${att.file_name}`).join('\n')}
      ` : ''}
      
      View the full note at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent
      
      ---
      This is an automated message from the Parent-Teacher Communication System.
      Please do not reply to this email.
    `

    return { subject, html, text }
  }

  private generatePasswordResetEmailTemplate(user: User, resetLink: string): EmailTemplate {
    const subject = 'Password Reset Request - Parent-Teacher Communication System'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello ${user.first_name},</p>
              <p>You have requested to reset your password for the Parent-Teacher Communication System.</p>
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">
                  Reset Password
                </a>
              </div>
              
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>This link will expire in 24 hours for security reasons.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the Parent-Teacher Communication System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request - Parent-Teacher Communication System
      
      Hello ${user.first_name},
      
      You have requested to reset your password for the Parent-Teacher Communication System.
      
      Click the link below to reset your password:
      ${resetLink}
      
      If you didn't request this password reset, please ignore this email.
      This link will expire in 24 hours for security reasons.
      
      ---
      This is an automated message from the Parent-Teacher Communication System.
      Please do not reply to this email.
    `

    return { subject, html, text }
  }

  public async sendNewNoteNotification(noteId: string): Promise<boolean> {
    try {
      // Get note with related data
      const { data: note, error: noteError } = await this.supabase
        .from('daily_notes')
        .select(`
          *,
          student:students(*, parent:users(*), class:classes(*, school:schools(*))),
          teacher:users(*),
          attachments:note_attachments(*)
        `)
        .eq('id', noteId)
        .single()

      if (noteError || !note) {
        console.error('Error fetching note:', noteError)
        return false
      }

      if (!note.student?.parent) {
        console.log('No parent found for student')
        return false
      }

      // Generate email template
      const template = this.generateNewNoteEmailTemplate(note, note.student.parent)

      // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
      // For now, we'll just log the email and mark it as sent
      console.log('Email would be sent:', {
        to: note.student.parent.email,
        subject: template.subject,
        html: template.html
      })

      // Record the notification in the database
      await this.supabase
        .from('email_notifications')
        .insert({
          user_id: note.student.parent.id,
          note_id: note.id,
          email_type: 'new_note',
          status: 'sent'
        })

      return true
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  public async sendPasswordResetEmail(userId: string, resetLink: string): Promise<boolean> {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return false
      }

      if (!user.email) {
        console.error('User has no email address')
        return false
      }

      const template = this.generatePasswordResetEmailTemplate(user, resetLink)

      // In a real implementation, you would integrate with an email service
      console.log('Password reset email would be sent:', {
        to: user.email,
        subject: template.subject,
        html: template.html
      })

      return true
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return false
    }
  }

  public async sendWelcomeEmail(userId: string): Promise<boolean> {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return false
      }

      if (!user.email) {
        console.error('User has no email address')
        return false
      }

      const subject = 'Welcome to Parent-Teacher Communication System'
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to the Parent-Teacher Communication System!</h1>
              </div>
              <div class="content">
                <p>Hello ${user.first_name},</p>
                <p>Your account has been successfully created. You can now access the system using your phone number and password.</p>
                <p>Account Details:</p>
                <ul>
                  <li>Name: ${user.first_name} ${user.last_name}</li>
                  <li>Phone: ${user.phone_number}</li>
                  <li>Role: ${user.role}</li>
                </ul>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">
                    Access Your Dashboard
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `

      console.log('Welcome email would be sent:', {
        to: user.email,
        subject,
        html
      })

      return true
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()