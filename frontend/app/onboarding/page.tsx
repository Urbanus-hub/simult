import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/login')
  }

  // Check if role is already assigned in session metadata
  const role = sessionClaims?.metadata.role

  if (role === 'admin') {
    redirect('/admin')
  }

  if (role === 'moderator') {
    // Determine where moderator goes, assuming admin for now or users
    redirect('/admin') 
  }

  if (role === 'user') {
    redirect('/users')
  }

  // Role is missing, default to 'user'
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'user',
      },
    })
    
    // Force refresh session tokens or just redirect?
    // Redirecting to /users is safe, the session might not update immediately 
    // but the db/clerk holds the truth.
    // For immediate reflection in `sessionClaims`, we might need a re-login or 
    // relying on the redirect to re-trigger middleware/claims fetch if configured.
    // But for now, just redirecting.
  } catch (err) {
    console.error('Failed to set default role:', err)
  }

  redirect('/users')
}
