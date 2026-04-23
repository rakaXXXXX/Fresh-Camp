import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendResetEmail } from "@/lib/mail"

export async function POST(req) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Jika email ada, link akan dikirim" },
        { status: 200 }
      )
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex")

    const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1 jam

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
      },
    })

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    await sendResetEmail(email, resetLink)

    return NextResponse.json({ message: "Email reset dikirim" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}