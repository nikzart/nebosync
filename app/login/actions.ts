'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function staffLogin(email: string, password: string) {
  try {
    await signIn('staff-login', {
      email,
      password,
    })
    return { success: true, redirectTo: '/staff' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        default:
          return { error: 'Something went wrong' }
      }
    }
    throw error
  }
}

export async function guestLogin(phone: string, roomNumber: string) {
  try {
    await signIn('guest-login', {
      phone,
      roomNumber,
    })
    return { success: true, redirectTo: '/guest' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        default:
          return { error: 'Something went wrong' }
      }
    }
    throw error
  }
}
