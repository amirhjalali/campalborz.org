/**
 * Email Templates
 *
 * HTML email templates for various notification types.
 * These can be used with email services like SendGrid, Mailgun, or AWS SES.
 */

export interface DonationReceiptData {
  donorName: string;
  donorEmail: string;
  amount: number; // in cents
  donationType: 'ONE_TIME' | 'RECURRING';
  date: string;
  transactionId: string;
  campaign?: string;
  message?: string;
  isAnonymous: boolean;
}

export interface ApplicationConfirmationData {
  applicantName: string;
  applicantEmail: string;
  submissionDate: string;
  applicationId: string;
}

export interface EventReminderData {
  recipientName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventUrl: string;
}

/**
 * Base email template with Camp Alborz branding
 */
function emailBase(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Camp Alborz</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #8B5A3C 0%, #D4A574 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      margin: 0;
      text-decoration: none;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #8B5A3C;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .amount-box {
      background: linear-gradient(135deg, #8B5A3C 0%, #D4A574 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      margin: 30px 0;
    }
    .amount {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
    }
    .detail-row {
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
    }
    .detail-label {
      color: #666666;
      font-weight: 500;
    }
    .detail-value {
      color: #333333;
      font-weight: 600;
    }
    .info-box {
      background-color: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #8B5A3C;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .amount {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Camp Alborz</h1>
      <p class="tagline">Celebrating Culture, Art, and Community</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Camp Alborz</strong></p>
      <p>A 501(c)(3) Non-Profit Organization</p>
      <p>Black Rock City, Nevada</p>
      <div class="social-links">
        <a href="https://www.campalborz.org">Website</a>
        <a href="https://instagram.com/campalborz">Instagram</a>
        <a href="https://facebook.com/campalborz">Facebook</a>
      </div>
      <p style="margin-top: 20px; color: #999999;">
        © ${new Date().getFullYear()} Camp Alborz. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Donation Receipt Email
 */
export function donationReceiptEmail(data: DonationReceiptData): string {
  const amountDollars = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <div class="content">
      <h2 style="color: #8B5A3C; margin-top: 0;">Thank You for Your Donation!</h2>

      <p>Dear ${data.isAnonymous ? 'Generous Supporter' : data.donorName},</p>

      <p>
        We are deeply grateful for your ${data.donationType === 'RECURRING' ? 'monthly recurring' : 'one-time'}
        donation to Camp Alborz. Your generosity helps us continue to celebrate Persian culture and
        create unforgettable experiences on the playa.
      </p>

      <div class="amount-box">
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Donation Amount</p>
        <p class="amount">$${amountDollars}</p>
        ${data.donationType === 'RECURRING' ? '<p style="margin: 0; font-size: 14px; opacity: 0.9;">Per Month</p>' : ''}
      </div>

      <h3 style="color: #333333; margin-top: 30px;">Receipt Details</h3>

      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${formattedDate}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Transaction ID:</span>
        <span class="detail-value">${data.transactionId}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Donation Type:</span>
        <span class="detail-value">${data.donationType === 'ONE_TIME' ? 'One-Time' : 'Monthly Recurring'}</span>
      </div>

      ${data.campaign ? `
      <div class="detail-row">
        <span class="detail-label">Campaign:</span>
        <span class="detail-value">${data.campaign}</span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${data.donorEmail}</span>
      </div>

      ${data.message ? `
      <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <p style="margin: 0; color: #666666; font-size: 14px;"><strong>Your Message:</strong></p>
        <p style="margin: 10px 0 0 0; color: #333333; font-style: italic;">"${data.message}"</p>
      </div>
      ` : ''}

      <div class="info-box">
        <p style="margin: 0; font-weight: 600; color: #1F2937;">Tax Deductible</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #4B5563;">
          Camp Alborz is a 501(c)(3) non-profit organization. Your donation is tax-deductible to
          the extent allowed by law. Please keep this receipt for your records.
        </p>
      </div>

      <p>
        Your contribution directly supports our art installations, workshops, cultural events, and
        community programs. Thank you for being part of our extended family!
      </p>

      <p style="text-align: center;">
        <a href="https://www.campalborz.org" class="button">Visit Our Website</a>
      </p>

      <p style="margin-top: 30px;">
        With gratitude,<br>
        <strong>The Camp Alborz Team</strong>
      </p>

      <p style="font-size: 12px; color: #999999; margin-top: 30px;">
        Questions about your donation? Contact us at
        <a href="mailto:donations@campalborz.org" style="color: #8B5A3C;">donations@campalborz.org</a>
      </p>
    </div>
  `;

  return emailBase(content);
}

/**
 * Application Confirmation Email
 */
export function applicationConfirmationEmail(data: ApplicationConfirmationData): string {
  const formattedDate = new Date(data.submissionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <div class="content">
      <h2 style="color: #8B5A3C; margin-top: 0;">Application Received!</h2>

      <p>Dear ${data.applicantName},</p>

      <p>
        Thank you for your interest in joining Camp Alborz! We've received your application
        and are excited to learn more about you.
      </p>

      <div class="info-box">
        <p style="margin: 0; font-weight: 600; color: #1F2937;">Application Details</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #4B5563;">
          <strong>Application ID:</strong> ${data.applicationId}<br>
          <strong>Submitted:</strong> ${formattedDate}<br>
          <strong>Email:</strong> ${data.applicantEmail}
        </p>
      </div>

      <h3 style="color: #333333;">What Happens Next?</h3>

      <ol style="color: #666666; line-height: 1.8;">
        <li>Our team will review your application within 5-7 business days</li>
        <li>We may reach out for additional information or to schedule an interview</li>
        <li>You'll receive an email with our decision</li>
        <li>If accepted, we'll send you onboarding information</li>
      </ol>

      <p>
        We receive many applications and carefully consider each one. We appreciate your patience
        as we review submissions.
      </p>

      <p style="text-align: center;">
        <a href="https://www.campalborz.org/about" class="button">Learn More About Us</a>
      </p>

      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Camp Alborz Membership Team</strong>
      </p>

      <p style="font-size: 12px; color: #999999; margin-top: 30px;">
        Questions? Contact us at
        <a href="mailto:membership@campalborz.org" style="color: #8B5A3C;">membership@campalborz.org</a>
      </p>
    </div>
  `;

  return emailBase(content);
}

/**
 * Event Reminder Email
 */
export function eventReminderEmail(data: EventReminderData): string {
  const content = `
    <div class="content">
      <h2 style="color: #8B5A3C; margin-top: 0;">Event Reminder</h2>

      <p>Hi ${data.recipientName},</p>

      <p>
        This is a friendly reminder about the upcoming event you registered for:
      </p>

      <div style="background: linear-gradient(135deg, #8B5A3C 0%, #D4A574 100%);
                  color: #ffffff; padding: 30px; text-align: center;
                  border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #ffffff; margin: 0 0 16px 0; font-size: 24px;">
          ${data.eventName}
        </h3>
        <p style="margin: 0; font-size: 18px; opacity: 0.9;">
          📅 ${data.eventDate} at ${data.eventTime}
        </p>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
          📍 ${data.eventLocation}
        </p>
      </div>

      <div class="info-box">
        <p style="margin: 0; font-weight: 600; color: #1F2937;">Important Reminders</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px; color: #4B5563;">
          <li>Arrive 15 minutes early</li>
          <li>Bring your confirmation email</li>
          <li>Dress comfortably</li>
          <li>Bring water and snacks if needed</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${data.eventUrl}" class="button">View Event Details</a>
      </p>

      <p>
        We're looking forward to seeing you there!
      </p>

      <p style="margin-top: 30px;">
        See you soon,<br>
        <strong>The Camp Alborz Events Team</strong>
      </p>

      <p style="font-size: 12px; color: #999999; margin-top: 30px;">
        Can't make it? Let us know at
        <a href="mailto:events@campalborz.org" style="color: #8B5A3C;">events@campalborz.org</a>
      </p>
    </div>
  `;

  return emailBase(content);
}

/**
 * Welcome Email for New Members
 */
export function welcomeEmail(name: string): string {
  const content = `
    <div class="content">
      <h2 style="color: #8B5A3C; margin-top: 0;">Welcome to Camp Alborz!</h2>

      <p>Dear ${name},</p>

      <p>
        We're thrilled to welcome you to the Camp Alborz family! You're now part of a vibrant
        community that celebrates Persian culture, art, and radical self-expression.
      </p>

      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B;
                  padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600; color: #92400E;">🎉 You're all set!</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350F;">
          Your member account is now active and ready to use.
        </p>
      </div>

      <h3 style="color: #333333;">Getting Started</h3>

      <p>Here are some things you can do right away:</p>

      <ol style="color: #666666; line-height: 1.8;">
        <li><strong>Complete Your Profile:</strong> Add your photo and bio</li>
        <li><strong>Explore Events:</strong> Check out our upcoming workshops and gatherings</li>
        <li><strong>Join Discussions:</strong> Connect with other members</li>
        <li><strong>Get Involved:</strong> Sign up to volunteer or contribute</li>
      </ol>

      <p style="text-align: center;">
        <a href="https://www.campalborz.org/members" class="button">Go to Member Portal</a>
      </p>

      <p>
        If you have any questions or need help getting started, don't hesitate to reach out.
        We're here to support you!
      </p>

      <p style="margin-top: 30px;">
        Welcome home,<br>
        <strong>The Camp Alborz Team</strong>
      </p>
    </div>
  `;

  return emailBase(content);
}

/**
 * Helper function to send emails (to be implemented with actual email service)
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // In production, integrate with email service:
  // - SendGrid: https://sendgrid.com
  // - AWS SES: https://aws.amazon.com/ses/
  // - Mailgun: https://www.mailgun.com
  // - Postmark: https://postmarkapp.com

  console.log('Sending email:', { to, subject });

  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
}
