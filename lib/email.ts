import nodemailer from 'nodemailer'

type OrderItem = { name: string; quantity: number; price: number; image?: string | null }

type OrderEmailData = {
  id: string
  total: number | string
  discount?: number | string | null
  couponCode?: string | null
  paymentId?: string | null
  items: OrderItem[] | unknown
  address?: {
    name: string; phone: string; line1: string; line2?: string | null
    city: string; state: string; pincode: string
  } | null
  user?: { name?: string | null; email?: string | null } | null
}

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
    from: process.env.SMTP_FROM || `"Universal Brew" <${process.env.SMTP_USER}>`,
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

const EMAIL_HEADER = `
  <tr>
    <td style="background-color:#1A0900;padding:36px 48px;text-align:center;">
      <h1 style="margin:0;color:#DAA830;font-size:28px;font-weight:bold;letter-spacing:-0.5px;font-family:Georgia,serif;">
        Universal Brew
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,sans-serif;">
        The Coffee Masters
      </p>
    </td>
  </tr>`

const EMAIL_FOOTER = `
  <tr>
    <td style="background-color:#f5ece4;padding:24px 48px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#b89880;font-family:Arial,sans-serif;">
        &copy; ${new Date().getFullYear()} Universal Brew &nbsp;|&nbsp; The Coffee Masters
      </p>
    </td>
  </tr>`

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#faf7f4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${EMAIL_HEADER}
        ${content}
        ${EMAIL_FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildItemsTable(items: unknown): string {
  const parsed: OrderItem[] = Array.isArray(items) ? items as OrderItem[] : []
  if (parsed.length === 0) return ''
  const rows = parsed.map(item => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#3d1f0d;border-bottom:1px solid #f0e6dc;">${item.name}</td>
      <td style="padding:8px 0;font-size:14px;color:#6b4c3b;text-align:center;border-bottom:1px solid #f0e6dc;">${item.quantity}</td>
      <td style="padding:8px 0;font-size:14px;color:#3d1f0d;text-align:right;border-bottom:1px solid #f0e6dc;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <th style="padding:0 0 8px;font-size:12px;color:#9b7b6b;text-align:left;border-bottom:2px solid #f0e6dc;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
        <th style="padding:0 0 8px;font-size:12px;color:#9b7b6b;text-align:center;border-bottom:2px solid #f0e6dc;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
        <th style="padding:0 0 8px;font-size:12px;color:#9b7b6b;text-align:right;border-bottom:2px solid #f0e6dc;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
      </tr>
      ${rows}
    </table>`
}

function ctaButton(label: string, url: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="background-color:#1A0900;border-radius:8px;padding:14px 32px;">
          <a href="${url}" style="color:#DAA830;font-size:15px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">${label}</a>
        </td>
      </tr>
    </table>`
}

export async function sendOrderConfirmationEmail(email: string, order: OrderEmailData) {
  const orderRef = order.id.slice(-8).toUpperCase()
  const subtotal = Number(order.total) + Number(order.discount ?? 0)
  const addr = order.address
  const addrLine = addr
    ? `${addr.name}, ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} — ${addr.pincode} · ${addr.phone}`
    : 'Not specified'

  const body = `
    <tr><td style="padding:48px 48px 32px;color:#3d1f0d;">
      <h2 style="margin:0 0 4px;font-size:22px;color:#3d1f0d;">Your order is confirmed!</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#9b7b6b;font-family:Arial,sans-serif;">Order #${orderRef}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b4c3b;">
        Thank you for your order, ${order.user?.name ?? 'Coffee Lover'}! We've received your payment and are getting your coffee ready.
      </p>
      ${buildItemsTable(order.items)}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        ${Number(order.discount) > 0 ? `
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b4c3b;">Subtotal</td>
          <td style="padding:4px 0;font-size:14px;color:#3d1f0d;text-align:right;">₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#6b4c3b;">Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</td>
          <td style="padding:4px 0;font-size:14px;color:#22863a;text-align:right;">−₹${Number(order.discount).toFixed(2)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 0;font-size:16px;font-weight:bold;color:#3d1f0d;border-top:2px solid #f0e6dc;">Total Paid</td>
          <td style="padding:8px 0;font-size:16px;font-weight:bold;color:#DAA830;text-align:right;border-top:2px solid #f0e6dc;">₹${Number(order.total).toFixed(2)}</td>
        </tr>
      </table>
      ${order.paymentId ? `<p style="margin:0 0 16px;font-size:12px;color:#9b7b6b;font-family:Arial,sans-serif;">Payment ID: ${order.paymentId}</p>` : ''}
      <p style="margin:0 0 8px;font-size:13px;color:#6b4c3b;font-family:Arial,sans-serif;"><strong>Delivery to:</strong> ${addrLine}</p>
      <hr style="border:none;border-top:1px solid #f0e6dc;margin:24px 0;"/>
      ${ctaButton('Track My Order', `${process.env.NEXTAUTH_URL}/account/orders`)}
      <p style="margin:0;font-size:13px;color:#9b7b6b;line-height:1.6;">Questions? Reply to this email or contact us anytime.</p>
    </td></tr>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Universal Brew" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmed #${orderRef} — Universal Brew`,
    html: emailWrapper(body),
  })
}

export async function sendPaymentFailedEmail(email: string, orderId: string, amount: number) {
  const orderRef = orderId.slice(-8).toUpperCase()
  const body = `
    <tr><td style="padding:48px 48px 32px;color:#3d1f0d;">
      <h2 style="margin:0 0 4px;font-size:22px;color:#3d1f0d;">Payment unsuccessful</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#9b7b6b;font-family:Arial,sans-serif;">Order #${orderRef}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b4c3b;">
        We weren't able to process your payment of <strong>₹${amount.toFixed(2)}</strong>. No charges were made to your account.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b4c3b;">
        Your cart items are still saved. Try again whenever you're ready — we'll be here!
      </p>
      <hr style="border:none;border-top:1px solid #f0e6dc;margin:0 0 24px;"/>
      ${ctaButton('Try Again', `${process.env.NEXTAUTH_URL}/checkout`)}
      <p style="margin:0;font-size:13px;color:#9b7b6b;line-height:1.6;">
        If you keep experiencing issues, please reach out to us and we'll help you out.
      </p>
    </td></tr>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Universal Brew" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Payment Failed — Universal Brew`,
    html: emailWrapper(body),
  })
}

export async function sendOrderCompletedEmail(email: string, order: OrderEmailData) {
  const orderRef = order.id.slice(-8).toUpperCase()

  const body = `
    <tr><td style="padding:48px 48px 32px;color:#3d1f0d;">
      <h2 style="margin:0 0 4px;font-size:22px;color:#3d1f0d;">Your order has been delivered!</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#9b7b6b;font-family:Arial,sans-serif;">Order #${orderRef}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b4c3b;">
        Your coffee has arrived, ${order.user?.name ?? 'Coffee Lover'}! We hope you enjoy every sip. ☕
      </p>
      ${buildItemsTable(order.items)}
      <div style="background:#faf7f4;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#6b4c3b;line-height:1.7;">
          <strong>Total:</strong> ₹${Number(order.total).toFixed(2)}
        </p>
      </div>
      <hr style="border:none;border-top:1px solid #f0e6dc;margin:0 0 24px;"/>
      ${ctaButton('Shop Again', `${process.env.NEXTAUTH_URL}/products`)}
      <p style="margin:0;font-size:13px;color:#9b7b6b;line-height:1.6;">
        Loved your order? Share it with friends — great coffee is meant to be shared.
      </p>
    </td></tr>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Universal Brew" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Order Has Been Delivered! — Universal Brew`,
    html: emailWrapper(body),
  })
}