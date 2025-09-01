import nodemailer from "nodemailer";

const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.zeptomail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
console.log({ emailConfig });

const transporter = nodemailer.createTransport(emailConfig);

transporter.verify(function (error, success) {
  if (error) {
    console.log("Email server connection error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

// OTP Email Template
const generateOTPEmailTemplate = (
  otp: string,
  expiresInMinutes: number = 15
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Verification Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for authentication is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code will expire in ${expiresInMinutes} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Virtual Flux Africa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "notification@virtualflux.africa",
      to: email,
      subject: "Your Verification Code",
      html: generateOTPEmailTemplate(otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export default transporter;
