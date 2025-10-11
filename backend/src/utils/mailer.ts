import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  // Mailtrap returns info but it's fine to log
  console.log("Email sent:", info.messageId);
  return info;
};
