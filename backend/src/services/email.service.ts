import nodemailer from "nodemailer";
import env from "../config/env";
import { logger } from "../utils/logger";

// Configure email transporter
const createTransporter = () => {
  // For development, use Ethereal Email (testing)
  if (env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    logger.warn(
      "No SMTP configuration found. Email functionality disabled in development."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// Email templates
const getInvitationEmailHTML = (
  inviterName: string,
  roomName: string,
  invitationLink: string,
  personalMessage?: string
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .message {
          background: #f3f4f6;
          border-left: 4px solid #6366f1;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .button {
          display: inline-block;
          background: #6366f1;
          color: #ffffff !important;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background: #4f46e5;
        }
        .info {
          background: #f9fafb;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .link {
          color: #6366f1;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Simult</div>
        </div>
        
        <h1>You've been invited to join a room!</h1>
        
        <p><strong>${inviterName}</strong> has invited you to join the room <strong>"${roomName}"</strong> on Simult.</p>
        
        ${
          personalMessage
            ? `<div class="message"><strong>Personal message:</strong><br>${personalMessage}</div>`
            : ""
        }
        
        <div style="text-align: center;">
          <a href="${invitationLink}" class="button">Accept Invitation</a>
        </div>
        
        <div class="info">
          <p><strong>What is Simult?</strong></p>
          <p>Simult is a real-time collaboration platform where teams can chat, manage tasks, and work together seamlessly.</p>
        </div>
        
        <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
        <p><a href="${invitationLink}" class="link">${invitationLink}</a></p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          This invitation will expire in 7 days. If you don't want to join this room, you can safely ignore this email.
        </p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Simult. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getInvitationEmailText = (
  inviterName: string,
  roomName: string,
  invitationLink: string,
  personalMessage?: string
) => {
  return `
You've been invited to join a room on Simult!

${inviterName} has invited you to join the room "${roomName}".

${personalMessage ? `Personal message:\n${personalMessage}\n\n` : ""}

Accept the invitation by clicking this link:
${invitationLink}

What is Simult?
Simult is a real-time collaboration platform where teams can chat, manage tasks, and work together seamlessly.

This invitation will expire in 7 days. If you don't want to join this room, you can safely ignore this email.

© ${new Date().getFullYear()} Simult. All rights reserved.
  `;
};

// Send invitation email
export const sendInvitationEmail = async ({
  to,
  inviterName,
  roomName,
  invitationLink,
  personalMessage,
}: {
  to: string;
  inviterName: string;
  roomName: string;
  invitationLink: string;
  personalMessage?: string;
}) => {
  if (!transporter) {
    logger.warn(`Email service not configured. Would send invitation to ${to}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Simult" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `You've been invited to join "${roomName}" on Simult`,
      text: getInvitationEmailText(
        inviterName,
        roomName,
        invitationLink,
        personalMessage
      ),
      html: getInvitationEmailHTML(
        inviterName,
        roomName,
        invitationLink,
        personalMessage
      ),
    });

    logger.success(`Invitation email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send invitation email to ${to}: ${error}`);
    throw error;
  }
};

// Send welcome email (optional)
export const sendWelcomeEmail = async (to: string, username: string) => {
  if (!transporter) {
    logger.warn(
      `Email service not configured. Would send welcome email to ${to}`
    );
    return;
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 32px; font-weight: bold; color: #6366f1; }
          h1 { color: #1f2937; }
          .button { display: inline-block; background: #6366f1; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Simult</div>
          </div>
          <h1>Welcome to Simult, ${username}!</h1>
          <p>Thank you for joining Simult. You're now ready to collaborate with your team in real-time.</p>
          <p>Get started by:</p>
          <ul>
            <li>Creating your first room</li>
            <li>Inviting team members</li>
            <li>Starting conversations and managing tasks</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.FRONTEND_URL}" class="button">Get Started</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy collaborating!</p>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Simult" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: "Welcome to Simult!",
      text: `Welcome to Simult, ${username}! Thank you for joining. Get started by creating your first room and inviting team members.`,
      html,
    });

    logger.success(`Welcome email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send welcome email to ${to}: ${error}`);
    throw error;
  }
};

// Send password reset email (optional)
export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  if (!transporter) {
    logger.warn(
      `Email service not configured. Would send password reset to ${to}`
    );
    return;
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; background: #6366f1; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Simult" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: "Password Reset Request - Simult",
      text: `You requested to reset your password. Click this link to create a new password: ${resetLink}. This link will expire in 1 hour.`,
      html,
    });

    logger.success(`Password reset email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}: ${error}`);
    throw error;
  }
};

export default {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
