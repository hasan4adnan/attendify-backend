/**
 * Email Utility Functions
 * 
 * Handles sending emails (verification codes, password resets, MFA codes, etc.).
 * Uses nodemailer to send formatted HTML and plain text emails.
 * 
 * Usage:
 *   const email = require('./utils/email');
 *   await email.sendVerificationCode('user@example.com', '123456', 'signup');
 *   await email.sendVerificationCode('user@example.com', '123456', 'reset_password');
 *   await email.sendVerificationCode('user@example.com', '123456', 'mfa');
 */

const nodemailer = require('nodemailer');

const config = require('../config/env');

/**
 * Send a verification code via email
 * 
 * Handles sending verification emails for signup, password reset, and MFA purposes.
 * Uses nodemailer to send both plain text and HTML formatted emails.
 * 
 * @param {string} to - Recipient email address
 * @param {string} code - Numeric verification code
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @returns {Promise<void>}
 */
async function sendVerificationCode(to, code, purpose = 'signup') {
  try {
    console.log(`Starting email sending process for ${purpose}...`);
    
    // Validate email configuration
    if (!config.email.host || !config.email.user || !config.email.password || !config.email.from) {
      console.warn('⚠️  Email configuration is incomplete. Email will not be sent.');
      console.warn('   Please configure EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in your .env file.');
      console.log(`📧 Verification code for ${to}: ${code} (purpose: ${purpose})`);
      return; // Exit gracefully without throwing error
    }
    
    // Debug: Log email configuration (mask password)
    const maskedPassword = config.email.password ? 
      (config.email.password.length > 4 ? 
        config.email.password.substring(0, 2) + '***' + config.email.password.substring(config.email.password.length - 2) : 
        '***') : 
      'NOT SET';
    console.log(`📧 Email config: Host=${config.email.host}, User=${config.email.user}, Password=${maskedPassword}, From=${config.email.from}`);
    
    // Determine subject and message based on purpose
    const purposeMessages = {
      signup: {
        subject: 'Attendify - Email Verification',
        greeting: 'Welcome to Attendify!',
        message: 'Please verify your email address to complete your registration.',
      },
      reset_password: {
        subject: 'Attendify - Password Reset',
        greeting: 'Password Reset Request',
        message: 'You requested to reset your password. Use the code below to proceed.',
      },
      mfa: {
        subject: 'Attendify - Multi-Factor Authentication',
        greeting: 'MFA Verification Code',
        message: 'Use the code below to complete your login.',
      },
    };
    
    const purposeConfig = purposeMessages[purpose] || purposeMessages.signup;
    
    // Create email content
    const subject = purposeConfig.subject;
    const text = `
${purposeConfig.greeting}

${purposeConfig.message}

Your verification code is: ${code}

This code expires in ${config.verification.ttlMinutes} minutes.

If you didn't request this code, please ignore this email.

Best regards,
The Attendify Team
    `.trim();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code-box { background-color: #f4f4f4; border: 2px dashed #333; padding: 20px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${purposeConfig.greeting}</h2>
    <p>${purposeConfig.message}</p>
    <div class="code-box">${code}</div>
    <p>This code expires in <strong>${config.verification.ttlMinutes} minutes</strong>.</p>
    <p>If you didn't request this code, please ignore this email.</p>
    <div class="footer">
      <p>Best regards,<br>The Attendify Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    
    // Clean password - remove spaces that Gmail app passwords might have
    const cleanPassword = config.email.password.replace(/\s/g, '');
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true for 465, false for other ports
      requireTLS: true, // Force TLS
      auth: {
        user: config.email.user,
        pass: cleanPassword, // Use cleaned password without spaces
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    
    console.log(`✅ Email sent successfully to ${to} (purpose: ${purpose})`);
  } catch (error) {
    console.error(`❌ Error sending verification code via email to ${to}:`, error.message);
    // Log detailed error for debugging
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Gmail Authentication Failed!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('To fix this, follow these steps:');
      console.error('');
      console.error('1. Enable 2-Step Verification:');
      console.error('   → https://myaccount.google.com/security');
      console.error('');
      console.error('2. Generate App Password:');
      console.error('   → https://myaccount.google.com/apppasswords');
      console.error('   → Select: App = "Mail", Device = "Other (Custom name)"');
      console.error('   → Name it "Attendify Backend"');
      console.error('   → Copy the 16-character password');
      console.error('');
      console.error('3. Update your .env file:');
      console.error(`   EMAIL_USER=${config.email.user || 'YOUR_EMAIL@gmail.com'}`);
      console.error('   EMAIL_PASSWORD=your-16-char-app-password-here');
      console.error('');
      console.error('4. Restart your server after updating .env');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    // Don't throw error - allow registration to continue
    // The verification code is still generated and returned in the response
    console.warn('⚠️  Email sending failed, but registration will continue.');
    console.warn(`📧 Verification code for ${to}: ${code} (available in API response)`);
  } finally {
    console.log('Email sending process has been completed.');
  }
}

/**
 * Send a welcome email after successful email verification
 * 
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<void>}
 */
async function sendWelcomeEmail(to, name) {
  try {
    console.log(`Starting welcome email sending process to ${to}...`);
    
    // Validate email configuration
    if (!config.email.host || !config.email.user || !config.email.password || !config.email.from) {
      console.warn('⚠️  Email configuration is incomplete. Welcome email will not be sent.');
      return; // Exit gracefully without throwing error
    }
    
    const subject = 'Attendify - Welcome! Your Email Has Been Verified';
    const userName = name || 'there';
    
    const text = `
Welcome to Attendify, ${userName}!

Your email address has been successfully verified. You can now access all features of Attendify.

Thank you for joining us!

Best regards,
The Attendify Team
    `.trim();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Attendify!</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>Your email address has been successfully verified. You can now access all features of Attendify.</p>
      <p>Thank you for joining us! We're excited to have you on board.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The Attendify Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    
    // Clean password - remove spaces that Gmail app passwords might have
    const cleanPassword = config.email.password.replace(/\s/g, '');
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.email.user,
        pass: cleanPassword, // Use cleaned password without spaces
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    
    console.log(`✅ Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${to}:`, error.message);
    // Don't throw error - allow verification to continue
    console.warn('⚠️  Welcome email failed, but email verification will proceed');
  }
}

/**
 * Send a login notification email
 * 
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} loginTime - Login timestamp (optional)
 * @returns {Promise<void>}
 */
async function sendLoginNotificationEmail(to, name, loginTime = null) {
  try {
    console.log(`Starting login notification email sending process to ${to}...`);
    
    // Validate email configuration
    if (!config.email.host || !config.email.user || !config.email.password || !config.email.from) {
      console.warn('⚠️  Email configuration is incomplete. Login notification email will not be sent.');
      return; // Exit gracefully without throwing error
    }
    
    const subject = 'Attendify - New Login Detected';
    const userName = name || 'there';
    const time = loginTime || new Date().toLocaleString();
    
    const text = `
Hello ${userName},

We detected a new login to your Attendify account.

Login time: ${time}

If this was you, you can safely ignore this email.

If you did not log in, please secure your account immediately by changing your password.

Best regards,
The Attendify Team
    `.trim();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .info-box { background-color: #fff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
    .warning { color: #f44336; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Login Detected</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>We detected a new login to your Attendify account.</p>
      <div class="info-box">
        <p><strong>Login time:</strong> ${time}</p>
      </div>
      <p>If this was you, you can safely ignore this email.</p>
      <p class="warning">If you did not log in, please secure your account immediately by changing your password.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The Attendify Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    
    // Clean password - remove spaces that Gmail app passwords might have
    const cleanPassword = config.email.password.replace(/\s/g, '');
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.email.user,
        pass: cleanPassword, // Use cleaned password without spaces
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    
    console.log(`✅ Login notification email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending login notification email to ${to}:`, error.message);
    // Don't throw error for login notifications - it shouldn't block login
    console.warn('⚠️  Login notification email failed, but login will proceed');
  }
}

/**
 * Generate a random numeric verification code
 * 
 * @param {number} length - Length of the code (default from config)
 * @returns {string} Numeric verification code
 */
function generateVerificationCode(length = null) {
  const codeLength = length || config.verification.codeLength;
  return Array.from({ length: codeLength }, () => Math.floor(Math.random() * 10)).join('');
}

module.exports = {
  sendVerificationCode,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  generateVerificationCode,
};

