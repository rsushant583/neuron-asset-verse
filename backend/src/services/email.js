import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Load email templates
const templates = {
  'email-verification': fs.readFileSync(path.join(__dirname, '../templates/email-verification.html'), 'utf8'),
  'password-reset': fs.readFileSync(path.join(__dirname, '../templates/password-reset.html'), 'utf8'),
  'purchase-confirmation': fs.readFileSync(path.join(__dirname, '../templates/purchase-confirmation.html'), 'utf8'),
  'sale-notification': fs.readFileSync(path.join(__dirname, '../templates/sale-notification.html'), 'utf8')
};

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, template, context, attachments }) => {
  try {
    // Get template content
    let html = templates[template];
    
    if (!html) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // Replace placeholders with context values
    if (context) {
      Object.keys(context).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, context[key]);
      });
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MetaMind" <noreply@metamind.app>',
      to,
      subject,
      html,
      attachments
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    logger.info('Email service is ready');
    return true;
  } catch (error) {
    logger.error('Email service configuration error:', error);
    return false;
  }
};

export default {
  sendEmail,
  verifyEmailConfig
};