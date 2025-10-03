import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function Home() {
  const session = await auth()

  if (session) {
    // Redirect based on role
    if (session.user.role === 'GUEST') {
      redirect('/guest')
    } else {
      redirect('/staff')
    }
  }

  // If not logged in, redirect to login
  redirect('/login')
}
