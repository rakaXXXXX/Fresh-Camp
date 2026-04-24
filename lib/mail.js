import { Resend } from "resend"

export async function sendResetEmail(email, link) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset Password",
    html: `
      <h2>Reset Password</h2>
      <p>Klik tombol di bawah untuk reset password:</p>

      <a href="${link}"
         style="
           background:#6B8E6B;
           color:white;
           padding:12px 20px;
           border-radius:8px;
           text-decoration:none;">
         Reset Password
      </a>

      <p>Link berlaku 1 jam.</p>
    `,
  })

  if (error) {
    console.error("RESEND ERROR:", error)
    throw new Error("Email gagal dikirim")
  }

  return data
}