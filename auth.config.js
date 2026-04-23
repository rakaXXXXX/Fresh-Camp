// auth.config.js
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email dan password wajib diisi')
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  })

  if (!user || !user.password) {
    throw new Error('Email atau password salah')
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  )

  if (!isPasswordValid) {
    throw new Error('Email atau password salah')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  }
}
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
  async session({ session, user }) {
    session.user.role = user.role
    return session
  }
}
};