// Email service for sending transactional emails
// In production, this would integrate with services like SendGrid, Mailgun, or AWS SES

export interface EmailConfig {
  provider: "sendgrid" | "mailgun" | "ses" | "resend";
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  metadata?: Record<string, any>;
}

class EmailService {
  private config: EmailConfig | null = null;

  configure(config: EmailConfig) {
    this.config = config;
  }

  async send(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config) {
      throw new Error("Email service not configured");
    }

    try {
      // In production, integrate with actual email provider
      // Example for SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.config.apiKey);
      // const result = await sgMail.send({
      //   to: emailData.to,
      //   from: { email: this.config.fromEmail, name: this.config.fromName },
      //   subject: emailData.subject,
      //   html: emailData.html,
      //   text: emailData.text,
      // });

      // Mock implementation for development
      console.log("📧 Email sent:", {
        provider: this.config.provider,
        to: emailData.to,
        subject: emailData.subject,
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        timestamp: new Date().toISOString(),
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendTemplate(
    templateName: string,
    to: string,
    data: Record<string, any>,
    options?: {
      cc?: string[];
      bcc?: string[];
      attachments?: EmailData["attachments"];
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = await this.getTemplate(templateName, data);
    
    return this.send({
      to,
      cc: options?.cc,
      bcc: options?.bcc,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: options?.attachments,
      metadata: { template: templateName, ...data },
    });
  }

  private async getTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    const templates = {
      "member-application-received": {
        subject: "Application Received - {{campName}}",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">Thank you for your application!</h1>
            <p>Hi {{applicantName}},</p>
            <p>We've received your application to join {{campName}}. Our team will review it and get back to you within a week.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>What happens next?</h3>
              <ol>
                <li>Application review by our camp leads</li>
                <li>Virtual or in-person meetup invitation</li>
                <li>Welcome to the camp family!</li>
              </ol>
            </div>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>The {{campName}} Team</p>
          </div>
        `,
        text: `
Hi {{applicantName}},

We've received your application to join {{campName}}. Our team will review it and get back to you within a week.

What happens next?
1. Application review by our camp leads
2. Virtual or in-person meetup invitation
3. Welcome to the camp family!

If you have any questions, feel free to reply to this email.

Best regards,
The {{campName}} Team
        `,
      },
      "member-application-approved": {
        subject: "Welcome to {{campName}}! Your application has been approved",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">Welcome to {{campName}}!</h1>
            <p>Hi {{memberName}},</p>
            <p>Great news! Your application to join {{campName}} has been approved. We're excited to welcome you to our community!</p>
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Getting Started</h3>
              <ul>
                <li>Join our community chat: {{communityLink}}</li>
                <li>Check out upcoming events: {{eventsLink}}</li>
                <li>Review member guidelines: {{guidelinesLink}}</li>
              </ul>
            </div>
            <p>We can't wait to meet you at our next event!</p>
            <p>Welcome to the family,<br>The {{campName}} Team</p>
          </div>
        `,
      },
      "donation-receipt": {
        subject: "Tax Receipt for Your Donation - {{campName}}",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">Thank you for your donation!</h1>
            <p>Dear {{donorName}},</p>
            <p>Thank you for your generous donation to {{campName}}. Your support helps us continue our mission.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Donation Details</h3>
              <table style="width: 100%;">
                <tr><td><strong>Amount:</strong></td><td>${{amount}}</td></tr>
                <tr><td><strong>Date:</strong></td><td>{{date}}</td></tr>
                <tr><td><strong>Transaction ID:</strong></td><td>{{transactionId}}</td></tr>
                {{#campaign}}<tr><td><strong>Campaign:</strong></td><td>{{campaign}}</td></tr>{{/campaign}}
              </table>
            </div>
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tax Information:</strong></p>
              <p>{{campName}} is a registered 501(c)(3) non-profit organization. Your donation is tax-deductible to the full extent allowed by law.</p>
              <p><strong>EIN:</strong> {{ein}}</p>
            </div>
            <p>If you have any questions about your donation, please don't hesitate to contact us.</p>
            <p>With gratitude,<br>The {{campName}} Team</p>
          </div>
        `,
      },
      "event-rsvp-confirmation": {
        subject: "RSVP Confirmed: {{eventTitle}}",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">You're all set for {{eventTitle}}!</h1>
            <p>Hi {{attendeeName}},</p>
            <p>Your RSVP for {{eventTitle}} has been confirmed. We're looking forward to seeing you there!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Event Details</h3>
              <table style="width: 100%;">
                <tr><td><strong>Event:</strong></td><td>{{eventTitle}}</td></tr>
                <tr><td><strong>Date:</strong></td><td>{{eventDate}}</td></tr>
                <tr><td><strong>Time:</strong></td><td>{{eventTime}}</td></tr>
                <tr><td><strong>Location:</strong></td><td>{{eventLocation}}</td></tr>
                {{#eventAddress}}<tr><td><strong>Address:</strong></td><td>{{eventAddress}}</td></tr>{{/eventAddress}}
              </table>
            </div>
            {{#eventDescription}}
            <div style="margin: 20px 0;">
              <h3>About this Event</h3>
              <p>{{eventDescription}}</p>
            </div>
            {{/eventDescription}}
            <p>If you need to change or cancel your RSVP, please contact us as soon as possible.</p>
            <p>See you soon!<br>The {{campName}} Team</p>
          </div>
        `,
      },
      "password-reset": {
        subject: "Reset your password - {{campName}}",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">Reset your password</h1>
            <p>Hi {{userName}},</p>
            <p>We received a request to reset your password for your {{campName}} account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetLink}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The {{campName}} Team</p>
          </div>
        `,
      },
      "member-welcome": {
        subject: "Welcome to the {{campName}} community!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">Welcome to {{campName}}!</h1>
            <p>Hi {{memberName}},</p>
            <p>Welcome to our community! We're thrilled to have you join us on this incredible journey.</p>
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Get Started</h3>
              <ul>
                <li><a href="{{profileLink}}">Complete your profile</a></li>
                <li><a href="{{eventsLink}}">Browse upcoming events</a></li>
                <li><a href="{{communityLink}}">Join our community discussions</a></li>
                <li><a href="{{guidelinesLink}}">Read our community guidelines</a></li>
              </ul>
            </div>
            <p>Our community thrives on participation, creativity, and mutual support. We can't wait to see what you'll contribute!</p>
            <p>If you have any questions, don't hesitate to reach out.</p>
            <p>Welcome to the family,<br>The {{campName}} Team</p>
          </div>
        `,
      },
    };

    const template = templates[templateName as keyof typeof templates];
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    // Simple template variable replacement
    // In production, use a proper template engine like Handlebars
    const processTemplate = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    return {
      subject: processTemplate(template.subject),
      html: processTemplate(template.html),
      text: template.text ? processTemplate(template.text) : undefined,
    };
  }
}

export const emailService = new EmailService();

// Email queue for background processing
export interface EmailJob {
  id: string;
  type: "template" | "direct";
  template?: string;
  data: EmailData | { templateName: string; to: string; data: Record<string, any> };
  priority: "high" | "normal" | "low";
  scheduledAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

class EmailQueue {
  private queue: EmailJob[] = [];
  private processing = false;

  async add(job: Omit<EmailJob, "id" | "attempts" | "createdAt" | "status">): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.queue.push({
      ...job,
      id,
      attempts: 0,
      createdAt: new Date(),
      status: "pending",
    });

    this.processQueue();
    
    return id;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.find(j => 
        j.status === "pending" && 
        (!j.scheduledAt || j.scheduledAt <= new Date())
      );

      if (!job) break;

      job.status = "processing";
      job.attempts++;

      try {
        if (job.type === "template") {
          const { templateName, to, data } = job.data as any;
          await emailService.sendTemplate(templateName, to, data);
        } else {
          await emailService.send(job.data as EmailData);
        }

        job.status = "completed";
        console.log(`📧 Email job ${job.id} completed`);
      } catch (error) {
        console.error(`📧 Email job ${job.id} failed:`, error);
        
        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
        } else {
          job.status = "pending";
          // Add exponential backoff
          job.scheduledAt = new Date(Date.now() + Math.pow(2, job.attempts) * 1000);
        }
      }

      // Remove completed or failed jobs
      if (job.status === "completed" || job.status === "failed") {
        const index = this.queue.indexOf(job);
        this.queue.splice(index, 1);
      }

      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  getQueueStatus() {
    const pending = this.queue.filter(j => j.status === "pending").length;
    const processing = this.queue.filter(j => j.status === "processing").length;
    
    return {
      pending,
      processing,
      total: this.queue.length,
    };
  }
}

export const emailQueue = new EmailQueue();