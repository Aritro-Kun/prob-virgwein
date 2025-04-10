import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    html: `
      <p>Hi there,</p>
      <p>Thanks for signing up. Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you didn't sign up, you can ignore this email.</p>
    `,
  });
};
