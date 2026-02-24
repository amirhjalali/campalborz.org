import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import logger from './logger';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const EMAIL_FROM = process.env.EMAIL_FROM || 'Camp Alborz <noreply@campalborz.org>';
const APP_URL = process.env.APP_URL || 'https://campalborz.org';

// Determine which transport to use: SendGrid first, then SMTP, then log-only
let transportMode: 'sendgrid' | 'smtp' | 'log' = 'log';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  transportMode = 'sendgrid';
  logger.info('Email transport: SendGrid');
} else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transportMode = 'smtp';
  logger.info('Email transport: SMTP (Nodemailer)');
} else {
  logger.warn('Email transport: log-only (no SENDGRID_API_KEY or SMTP credentials configured)');
}

// Lazy-initialised Nodemailer transport
let _nodemailerTransport: nodemailer.Transporter | null = null;
function getNodemailerTransport(): nodemailer.Transporter {
  if (!_nodemailerTransport) {
    _nodemailerTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return _nodemailerTransport;
}

// ---------------------------------------------------------------------------
// Brand constants used across every template
// ---------------------------------------------------------------------------

const BRAND = {
  sage: '#4A5D5A',
  sageDark: '#2F4243',
  sageLight: '#8A9D9A',
  desertTan: '#D4C4A8',
  desertTanLight: '#F5EFE6',
  gold: '#D4AF37',
  goldDark: '#AC8A21',
  cream: '#FAF7F2',
  ink: '#2C2416',
  inkSecondary: '#5A4F3C',
  borderLight: '#E9E2D5',
  fontDisplay: "'Cinzel', 'Georgia', serif",
  fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  fontAccent: "'Cormorant', 'Georgia', serif",
} as const;

// ---------------------------------------------------------------------------
// Core send helper
// ---------------------------------------------------------------------------

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, html, text } = payload;

  if (transportMode === 'log') {
    logger.info(`[EMAIL-LOG] To: ${to} | Subject: ${subject}`);
    logger.debug(`[EMAIL-LOG] Text:\n${text}`);
    return true;
  }

  try {
    if (transportMode === 'sendgrid') {
      await sgMail.send({
        to,
        from: EMAIL_FROM,
        subject,
        html,
        text,
      });
    } else {
      const transport = getNodemailerTransport();
      await transport.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });
    }
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (err: any) {
    logger.error(`Failed to send email to ${to}: ${err.message || err}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// HTML template helpers
// ---------------------------------------------------------------------------

/**
 * Wraps email body content in the branded layout shell.
 * Uses table-based layout for maximum email client compatibility.
 */
function layout(bodyContent: string, preheaderText?: string): string {
  const preheader = preheaderText
    ? `<span style="display:none;font-size:1px;color:${BRAND.cream};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheaderText}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Camp Alborz</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${BRAND.desertTanLight}; }
    a { color: ${BRAND.gold}; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .padding-mobile { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.desertTanLight};font-family:${BRAND.fontBody};">
  ${preheader}

  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BRAND.desertTanLight};">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Main card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(44,36,22,0.1);">

          <!-- Header band -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.sage} 0%, ${BRAND.sageDark} 100%);padding:32px 40px;text-align:center;">
              <!-- Gold accent line -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="60" style="margin:0 auto 16px auto;">
                <tr><td style="height:2px;background-color:${BRAND.gold};"></td></tr>
              </table>
              <h1 style="margin:0;font-family:${BRAND.fontDisplay};font-size:26px;font-weight:400;letter-spacing:3px;color:${BRAND.cream};text-transform:uppercase;">Camp Alborz</h1>
              <p style="margin:6px 0 0;font-family:${BRAND.fontAccent};font-size:14px;font-style:italic;color:${BRAND.desertTan};letter-spacing:1px;">Persian Hospitality on the Playa</p>
              <!-- Gold accent line -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="60" style="margin:16px auto 0 auto;">
                <tr><td style="height:2px;background-color:${BRAND.gold};"></td></tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="padding-mobile" style="padding:36px 40px;background-color:#ffffff;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.cream};padding:24px 40px;border-top:1px solid ${BRAND.borderLight};">
              <!-- Decorative divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
                <tr>
                  <td style="height:1px;background:linear-gradient(to right, transparent, ${BRAND.desertTan}, ${BRAND.gold}, ${BRAND.desertTan}, transparent);"></td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-family:${BRAND.fontDisplay};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.sageLight};text-align:center;">Camp Alborz &middot; Black Rock City</p>
              <p style="margin:0;font-family:${BRAND.fontBody};font-size:12px;color:${BRAND.inkSecondary};text-align:center;line-height:1.6;">
                <a href="${APP_URL}" style="color:${BRAND.sage};text-decoration:underline;">campalborz.org</a>
              </p>
              <p style="margin:12px 0 0;font-family:${BRAND.fontBody};font-size:11px;color:${BRAND.sageLight};text-align:center;line-height:1.5;">
                You received this email because of your relationship with Camp Alborz.<br />
                If you believe this was sent in error, please contact us at info@campalborz.org.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates a branded CTA button (table-based for Outlook compatibility).
 */
function ctaButton(text: string, href: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
  <tr>
    <td style="border-radius:6px;background:linear-gradient(135deg, ${BRAND.gold} 0%, ${BRAND.goldDark} 100%);">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:${BRAND.fontDisplay};font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

/**
 * Renders a heading line within the email body.
 */
function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-family:${BRAND.fontDisplay};font-size:20px;font-weight:400;letter-spacing:1px;color:${BRAND.sage};">${text}</h2>`;
}

/**
 * Renders a standard paragraph.
 */
function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${BRAND.fontBody};font-size:15px;line-height:1.7;color:${BRAND.ink};">${text}</p>`;
}

/**
 * Renders an informational box with a subtle background.
 */
function infoBox(content: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;">
  <tr>
    <td style="padding:20px 24px;background-color:${BRAND.cream};border-radius:6px;border-left:3px solid ${BRAND.gold};">
      ${content}
    </td>
  </tr>
</table>`;
}

/**
 * Small muted text.
 */
function smallText(text: string): string {
  return `<p style="margin:0 0 8px;font-family:${BRAND.fontBody};font-size:12px;line-height:1.6;color:${BRAND.inkSecondary};">${text}</p>`;
}

// ---------------------------------------------------------------------------
// Public email functions
// ---------------------------------------------------------------------------

/**
 * Send a welcome email to a newly registered / accepted member.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0];

  const html = layout(
    [
      heading(`Welcome to Camp Alborz, ${firstName}`),
      paragraph(
        'We are thrilled to welcome you to our community. Camp Alborz is built on the principles of ' +
        'radical inclusion, gifting, and the rich traditions of Persian hospitality.'
      ),
      paragraph(
        'As a member you now have access to your personal dashboard where you can manage your profile, ' +
        'track season details, and stay connected with the camp.'
      ),
      ctaButton('Visit Your Dashboard', `${APP_URL}/members`),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `<strong style="color:${BRAND.sage};">What&rsquo;s next?</strong><br/>` +
        `Complete your profile, review the upcoming season information, and introduce yourself in the group chat.</p>`
      ),
      paragraph(
        'If you have any questions, reach out to your camp leads or reply to this email. ' +
        'We look forward to seeing you in Black Rock City!'
      ),
      `<p style="margin:24px 0 0;font-family:${BRAND.fontAccent};font-size:16px;font-style:italic;color:${BRAND.sage};">With warmth and dust,<br/>The Camp Alborz Team</p>`,
    ].join('\n'),
    `Welcome to Camp Alborz, ${firstName}! Your journey begins now.`
  );

  const text = [
    `Welcome to Camp Alborz, ${firstName}!`,
    '',
    'We are thrilled to welcome you to our community. Camp Alborz is built on the principles of radical inclusion, gifting, and the rich traditions of Persian hospitality.',
    '',
    'As a member you now have access to your personal dashboard where you can manage your profile, track season details, and stay connected with the camp.',
    '',
    `Visit your dashboard: ${APP_URL}/members`,
    '',
    "What's next?",
    'Complete your profile, review the upcoming season information, and introduce yourself in the group chat.',
    '',
    'If you have any questions, reach out to your camp leads or reply to this email.',
    'We look forward to seeing you in Black Rock City!',
    '',
    'With warmth and dust,',
    'The Camp Alborz Team',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: `Welcome to Camp Alborz, ${firstName}!`, html, text });
}

/**
 * Send a password reset email with a secure token link.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  resetUrl?: string,
): Promise<boolean> {
  const url = resetUrl || `${APP_URL}/members/reset-password?token=${resetToken}`;

  const html = layout(
    [
      heading('Reset Your Password'),
      paragraph(
        'We received a request to reset the password for your Camp Alborz account. ' +
        'Click the button below to choose a new password.'
      ),
      ctaButton('Reset Password', url),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:13px;color:${BRAND.inkSecondary};line-height:1.6;">` +
        `This link will expire in <strong>1 hour</strong>. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will remain unchanged.</p>`
      ),
      smallText(`If the button above doesn&rsquo;t work, copy and paste this URL into your browser:`),
      `<p style="margin:0 0 16px;font-family:${BRAND.fontBody};font-size:12px;color:${BRAND.gold};word-break:break-all;line-height:1.5;">${url}</p>`,
    ].join('\n'),
    'Reset your Camp Alborz password'
  );

  const text = [
    'Reset Your Password',
    '',
    'We received a request to reset the password for your Camp Alborz account.',
    'Visit the following link to choose a new password:',
    '',
    url,
    '',
    'This link will expire in 1 hour.',
    "If you didn't request a password reset, you can safely ignore this email.",
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: 'Reset Your Camp Alborz Password', html, text });
}

/**
 * Send an invitation email for a new member to join Camp Alborz.
 */
export async function sendInviteEmail(
  to: string,
  inviterName: string,
  inviteToken: string,
  inviteUrl?: string,
): Promise<boolean> {
  const url = inviteUrl || `${APP_URL}/members/accept-invite?token=${inviteToken}`;

  const html = layout(
    [
      heading("You're Invited to Camp Alborz"),
      paragraph(
        `<strong style="color:${BRAND.sage};">${inviterName}</strong> has invited you to join Camp Alborz &mdash; ` +
        'a Burning Man theme camp celebrating Persian culture, community, and radical self-expression.'
      ),
      paragraph(
        'By accepting this invitation you will create your member account and gain access to the camp portal ' +
        'where you can manage your season participation, housing, payments, and more.'
      ),
      ctaButton('Accept Invitation', url),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `<strong style="color:${BRAND.sage};">About Camp Alborz</strong><br/>` +
        `Named after Iran&rsquo;s majestic mountain range, Camp Alborz brings the spirit of Persian hospitality to the playa. ` +
        `From communal feasts to immersive art, we create a home away from home in Black Rock City.</p>`
      ),
      smallText(`If the button above doesn&rsquo;t work, copy and paste this URL into your browser:`),
      `<p style="margin:0 0 16px;font-family:${BRAND.fontBody};font-size:12px;color:${BRAND.gold};word-break:break-all;line-height:1.5;">${url}</p>`,
    ].join('\n'),
    `${inviterName} has invited you to join Camp Alborz`
  );

  const text = [
    "You're Invited to Camp Alborz!",
    '',
    `${inviterName} has invited you to join Camp Alborz -- a Burning Man theme camp celebrating Persian culture, community, and radical self-expression.`,
    '',
    'Accept your invitation and create your account here:',
    url,
    '',
    'About Camp Alborz:',
    "Named after Iran's majestic mountain range, Camp Alborz brings the spirit of Persian hospitality to the playa.",
    'From communal feasts to immersive art, we create a home away from home in Black Rock City.',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: `You're Invited to Join Camp Alborz`, html, text });
}

/**
 * Send a confirmation email after a membership application is submitted.
 */
export async function sendApplicationConfirmation(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0];

  const html = layout(
    [
      heading('Application Received'),
      paragraph(
        `Thank you, ${firstName}! We have received your membership application for Camp Alborz. ` +
        'Our team will review your application and get back to you as soon as possible.'
      ),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `<strong style="color:${BRAND.sage};">What happens next?</strong><br/>` +
        `Our camp leads review every application personally. You can expect to hear back within 1&ndash;2 weeks. ` +
        `In the meantime, feel free to explore our website to learn more about the camp.</p>`
      ),
      ctaButton('Learn About Camp Alborz', `${APP_URL}/about`),
      paragraph(
        'If you have any questions while you wait, please don&rsquo;t hesitate to reach out to us at ' +
        '<a href="mailto:info@campalborz.org" style="color:' + BRAND.gold + ';">info@campalborz.org</a>.'
      ),
    ].join('\n'),
    `We received your Camp Alborz application, ${firstName}!`
  );

  const text = [
    'Application Received',
    '',
    `Thank you, ${firstName}! We have received your membership application for Camp Alborz.`,
    'Our team will review your application and get back to you as soon as possible.',
    '',
    "What happens next?",
    'Our camp leads review every application personally. You can expect to hear back within 1-2 weeks.',
    'In the meantime, feel free to explore our website to learn more about the camp.',
    '',
    `Learn more: ${APP_URL}/about`,
    '',
    'Questions? Contact us at info@campalborz.org',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: 'Application Received - Camp Alborz', html, text });
}

/**
 * Notify an applicant that their membership application has been approved.
 */
export async function sendApplicationApproved(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0];

  const html = layout(
    [
      heading('Congratulations! You&rsquo;re In'),
      paragraph(
        `Great news, ${firstName}! Your application to join Camp Alborz has been <strong style="color:${BRAND.sage};">approved</strong>. ` +
        'Welcome to the family!'
      ),
      paragraph(
        'You will receive a separate invitation email shortly with a link to set up your member account. ' +
        'Once your account is active you can access the member portal to manage your season participation.'
      ),
      ctaButton('Visit Camp Alborz', `${APP_URL}`),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `<strong style="color:${BRAND.sage};">Getting started</strong><br/>` +
        `Once you set up your account, complete your profile and review the current season details. ` +
        `Your camp leads will reach out with more information about next steps, dues, and logistics.</p>`
      ),
      `<p style="margin:24px 0 0;font-family:${BRAND.fontAccent};font-size:16px;font-style:italic;color:${BRAND.sage};">See you on the playa!<br/>The Camp Alborz Team</p>`,
    ].join('\n'),
    `Congratulations ${firstName}! Your Camp Alborz application has been approved.`
  );

  const text = [
    "Congratulations! You're In!",
    '',
    `Great news, ${firstName}! Your application to join Camp Alborz has been approved. Welcome to the family!`,
    '',
    'You will receive a separate invitation email shortly with a link to set up your member account.',
    'Once your account is active you can access the member portal to manage your season participation.',
    '',
    `Visit Camp Alborz: ${APP_URL}`,
    '',
    'Getting started:',
    'Once you set up your account, complete your profile and review the current season details.',
    'Your camp leads will reach out with more information about next steps, dues, and logistics.',
    '',
    'See you on the playa!',
    'The Camp Alborz Team',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: 'Welcome to Camp Alborz - Application Approved!', html, text });
}

/**
 * Notify an applicant that their membership application has been denied.
 */
export async function sendApplicationDenied(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0];

  const html = layout(
    [
      heading('Application Update'),
      paragraph(
        `Dear ${firstName}, thank you for your interest in Camp Alborz and for taking the time to submit your application.`
      ),
      paragraph(
        'After careful review, we are unable to offer you a spot in the camp for this season. ' +
        'Please know that this was a difficult decision &mdash; we receive many more applications than we have space for, ' +
        'and it does not reflect on you personally.'
      ),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `We encourage you to apply again for future seasons. Camp composition changes year to year, ` +
        `and we would love to consider you again.</p>`
      ),
      paragraph(
        'If you have questions or would like feedback, feel free to reach out to us at ' +
        '<a href="mailto:info@campalborz.org" style="color:' + BRAND.gold + ';">info@campalborz.org</a>.'
      ),
      paragraph('We wish you a wonderful Burn wherever you call home on the playa.'),
      `<p style="margin:24px 0 0;font-family:${BRAND.fontAccent};font-size:16px;font-style:italic;color:${BRAND.sage};">Warm regards,<br/>The Camp Alborz Team</p>`,
    ].join('\n'),
    `Camp Alborz application update for ${firstName}`
  );

  const text = [
    'Application Update',
    '',
    `Dear ${firstName}, thank you for your interest in Camp Alborz and for taking the time to submit your application.`,
    '',
    'After careful review, we are unable to offer you a spot in the camp for this season.',
    'Please know that this was a difficult decision -- we receive many more applications than we have space for, and it does not reflect on you personally.',
    '',
    'We encourage you to apply again for future seasons. Camp composition changes year to year, and we would love to consider you again.',
    '',
    'If you have questions or would like feedback, feel free to reach out to us at info@campalborz.org.',
    '',
    'We wish you a wonderful Burn wherever you call home on the playa.',
    '',
    'Warm regards,',
    'The Camp Alborz Team',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: 'Camp Alborz - Application Update', html, text });
}

/**
 * Send a membership renewal / dues reminder email.
 */
export async function sendMembershipReminder(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0];

  const html = layout(
    [
      heading('Season Reminder'),
      paragraph(
        `Hi ${firstName}! This is a friendly reminder that the new Camp Alborz season is approaching. ` +
        'Please log in to your member portal to confirm your participation and review any outstanding items.'
      ),
      ctaButton('Go to Member Portal', `${APP_URL}/members`),
      infoBox(
        `<p style="margin:0;font-family:${BRAND.fontBody};font-size:14px;color:${BRAND.ink};line-height:1.6;">` +
        `<strong style="color:${BRAND.sage};">Action items</strong><br/>` +
        `&bull; Confirm your participation status<br/>` +
        `&bull; Update your profile and emergency contacts<br/>` +
        `&bull; Review housing and logistics preferences<br/>` +
        `&bull; Check your dues and payment status</p>`
      ),
      paragraph(
        'If your plans have changed and you will not be joining us this season, please update your status so ' +
        'we can plan accordingly.'
      ),
      paragraph(
        'Questions? Reach out to your camp leads or email us at ' +
        '<a href="mailto:info@campalborz.org" style="color:' + BRAND.gold + ';">info@campalborz.org</a>.'
      ),
      `<p style="margin:24px 0 0;font-family:${BRAND.fontAccent};font-size:16px;font-style:italic;color:${BRAND.sage};">See you in the dust,<br/>The Camp Alborz Team</p>`,
    ].join('\n'),
    `Season reminder for ${firstName} - Action needed`
  );

  const text = [
    'Season Reminder',
    '',
    `Hi ${firstName}! This is a friendly reminder that the new Camp Alborz season is approaching.`,
    'Please log in to your member portal to confirm your participation and review any outstanding items.',
    '',
    `Member portal: ${APP_URL}/members`,
    '',
    'Action items:',
    '- Confirm your participation status',
    '- Update your profile and emergency contacts',
    '- Review housing and logistics preferences',
    '- Check your dues and payment status',
    '',
    'If your plans have changed and you will not be joining us this season, please update your status so we can plan accordingly.',
    '',
    'Questions? Email us at info@campalborz.org',
    '',
    'See you in the dust,',
    'The Camp Alborz Team',
    '',
    '---',
    'Camp Alborz | campalborz.org',
  ].join('\n');

  return sendEmail({ to, subject: 'Camp Alborz - Season Reminder', html, text });
}

// ---------------------------------------------------------------------------
// Named export for the entire service (useful for dependency injection / testing)
// ---------------------------------------------------------------------------

export const emailService = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInviteEmail,
  sendApplicationConfirmation,
  sendApplicationApproved,
  sendApplicationDenied,
  sendMembershipReminder,
};

export default emailService;
