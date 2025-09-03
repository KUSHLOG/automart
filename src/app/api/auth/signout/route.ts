import { signOut } from '@/server/auth/auth'

export async function POST() {
  await signOut({ redirectTo: '/' })
}
