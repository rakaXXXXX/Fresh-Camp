import { NextResponse } from 'next/server'
import {ZodError} from "zod"
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  }catch (error) {
  console.error('Register error:', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Terjadi kesalahan saat registrasi' },
    { status: 500 }
  )
}
}
