import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST environment variable is not set");
  }
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER environment variable is not set");
  }
  if (!process.env.SMTP_PASSWORD) {
    throw new Error("SMTP_PASSWORD environment variable is not set");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM environment variable is not set");
  }
  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify your email address</h1>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
    text: `Verify your email address by visiting: ${verifyUrl}`,
  });
}

export async function sendOTPEmail(email: string, otp: string) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM environment variable is not set");
  }
  const transporter = getTransporter();
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Your verification code</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; text-align: center; margin: 20px 0;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
  });
}

