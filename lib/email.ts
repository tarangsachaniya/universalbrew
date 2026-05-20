import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"Universal Brew" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password — Universal Brew',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#faf7f4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1A0900;padding:36px 48px;text-align:center;">
              <h1 style="margin:0;color:#DAA830;font-size:28px;font-weight:bold;letter-spacing:-0.5px;font-family:Georgia,serif;">
                Universal Brew
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,sans-serif;">
                The Coffee Masters
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;color:#3d1f0d;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#3d1f0d;">Forgot your password?</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b4c3b;">
                No worries — it happens to the best of us. Click the button below to reset your password.
                This link is valid for <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#1A0900;border-radius:8px;padding:14px 32px;">
                    <a href="${resetUrl}"
                       style="color:#DAA830;font-size:15px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #f0e6dc;margin:0 0 24px;" />

              <p style="margin:0;font-size:13px;color:#9b7b6b;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5ece4;padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b89880;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Universal Brew &nbsp;|&nbsp; The Coffee Masters
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}