import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer'

@Injectable()
export class OtpService {
  private prisma = new PrismaClient();

  // Generate and send OTP
  async generateAndSendOtp( email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Current time + 5 minutes

    // Store OTP and expiration in the database
    await this.prisma.otp.create({
      data: {
        otp,
        email,
        expiresAt,
      },
    });

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email provider, e.g., Gmail
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: email, // Recipient email address
      subject: 'Your OTP for Verification',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`, // Optional HTML format
    };

    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email. Please try again later.');
    }
  }

  // Verify OTP
  async verifyOtp(email: string, otp: number): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { email, otp, expiresAt: { gte: new Date() } }, // Check if OTP is valid and not expired
    });

    if (otpRecord) {
      // OTP is valid and not expired, delete OTP from database after successful verification
      await this.prisma.otp.delete({
        where: { id: otpRecord.id },
      });

      console.log(`OTP for ${email} verified successfully`);
      return true;
    }

    console.log(`OTP verification failed for ${email}`);
    return false;
  }
}
