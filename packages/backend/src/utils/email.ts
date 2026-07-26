import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async send(options: EmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${config.urls.patientPortal}/verify-email?token=${token}`;
    await this.send({
      to: email,
      subject: 'Verify your DiagnoConnect account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">DiagnoConnect</h1>
            <p style="margin: 5px 0 0;">Email Verification</p>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2>Welcome to DiagnoConnect!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">Verify Email</a>
            <p style="color: #6b7280; font-size: 14px;">If you did not create an account, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 15px; color: #9ca3af; font-size: 12px;">
            <p>DiagnoConnect - Connecting Healthcare</p>
          </div>
        </div>
      `,
    });
  }

  static async sendPasswordReset(email: string, token: string): Promise<void> {
    const url = `${config.urls.patientPortal}/reset-password?token=${token}`;
    await this.send({
      to: email,
      subject: 'Password Reset - DiagnoConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">DiagnoConnect</h1>
            <p style="margin: 5px 0 0;">Password Reset</p>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">Reset Password</a>
            <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });
  }

  static async sendAppointmentConfirmation(
    email: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    orgName: string
  ): Promise<void> {
    await this.send({
      to: email,
      subject: `Appointment Confirmed - ${orgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">DiagnoConnect</h1>
            <p style="margin: 5px 0 0;">Appointment Confirmation</p>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2>Appointment Confirmed</h2>
            <p>Dear ${patientName},</p>
            <p>Your appointment has been confirmed:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 8px; font-weight: bold;">Doctor:</td><td>${doctorName}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td>${date}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td>${time}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td>${orgName}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
  }

  static async sendLabResultReady(
    email: string,
    patientName: string,
    orgName: string
  ): Promise<void> {
    await this.send({
      to: email,
      subject: `Lab Results Ready - ${orgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">DiagnoConnect</h1>
            <p style="margin: 5px 0 0;">Lab Results</p>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2>Your Lab Results Are Ready</h2>
            <p>Dear ${patientName},</p>
            <p>Your laboratory results are now available. Please log in to view them.</p>
            <a href="${config.urls.patientPortal}/lab-results" style="display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">View Results</a>
          </div>
        </div>
      `,
    });
  }
}
