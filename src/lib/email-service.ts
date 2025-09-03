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

export const sendStatusMail = async (
  email: string,
  dto: DecisionEmailParams
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "notification@virtualflux.africa",
      to: email,
      subject: buildDecisionEmail(dto).subject,
      html: buildDecisionEmail(dto).html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

type DecisionStatus = "approved" | "rejected";

type DecisionEmailParams = {
  status: DecisionStatus;
  itemType: string;
  itemName: string;
  actorName?: string;
  submittedAt?: string;
  decisionAt?: string;
  orgName?: string;
};

export function buildDecisionEmail({
  status,
  itemType,
  itemName,
  actorName,
  decisionAt,
  submittedAt,
  orgName = "Virtual Flux Africa",
}: DecisionEmailParams): { subject: string; html: string } {
  const isApproved = status === "approved";
  const subject = `${itemType} ${
    isApproved ? "Approved" : "Rejected"
  }: ${itemName}`;

  const badge = isApproved
    ? { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Approved" }
    : { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Rejected" };

  const metaLines = [
    submittedAt ? `<div><strong>Submitted:</strong> ${submittedAt}</div>` : "",
    decisionAt
      ? `<div><strong>${
          isApproved ? "Approved" : "Reviewed"
        }:</strong> ${decisionAt}</div>`
      : "",
    actorName
      ? `<div><strong>${
          isApproved ? "Approved by" : "Reviewed by"
        }:</strong> ${actorName}</div>`
      : "",
  ].join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height:1.6; color:#333; margin:0; padding:0; }
    .container { max-width:600px; margin:0 auto; padding:20px; }
    .header { background:#4F46E5; color:#fff; padding:20px; text-align:center; border-radius:8px 8px 0 0; }
    .content { background:#f9fafb; padding:30px; border-radius:0 0 8px 8px; }
    .status-badge { display:inline-block; font-weight:bold; padding:6px 10px; border-radius:9999px; }
    .meta { margin:16px 0; font-size:14px; color:#475569; }
    .hr { height:1px; background:#e5e7eb; border:0; margin:24px 0; }
    .footer { text-align:center; margin-top:24px; font-size:12px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${itemType} ${
    isApproved ? "Approved" : "Decision"
  }</h1></div>
    <div class="content">
      <p>Your ${itemType.toLowerCase()} <strong>${itemName}</strong> has been
        <span class="status-badge" style="background:${badge.bg};color:${
    badge.color
  };border:1px solid ${badge.border};">
          ${badge.label}
        </span>.
      </p>

      <div class="meta">
        ${metaLines}
      </div>

      <hr class="hr" />
      <p>If you weren’t expecting this message, you can safely ignore it.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</div>
  </div>
</body>
</html>`;

  return { subject, html };
}

export default transporter;
