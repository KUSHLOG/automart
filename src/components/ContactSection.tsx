'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ContactSectionProps {
  vehicleId: string
  isOwner: boolean
  ownerName: string | null
}

export default function ContactSection({ vehicleId, isOwner, ownerName }: ContactSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isStartingConversation, setIsStartingConversation] = useState(false)
  const [error, setError] = useState('')

  const handleStartConversation = async () => {
    if (!session) {
      router.push(`/sign-in?callbackUrl=/vehicles/${vehicleId}`)
      return
    }

    setIsStartingConversation(true)
    setError('')

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId,
        }),
      })

      if (response.ok) {
        const conversation = await response.json()
        router.push(`/messages/${conversation.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start conversation')
      }
    } catch (err) {
      console.error('Error starting conversation:', err)
      setError('Failed to start conversation')
    } finally {
      setIsStartingConversation(false)
    }
  }

  if (isOwner) {
    return (
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700">
        <h3 className="text-xl font-semibold text-white mb-4">Your Vehicle</h3>
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-300 text-sm">
            This is your vehicle listing. Interested buyers can contact you through messages.
          </p>
          <Link
            href="/messages"
            className="block w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-center"
          >
            View Messages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700">
      <h3 className="text-xl font-semibold text-white mb-4">Contact Owner</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {session ? (
        <div className="space-y-4">
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-3">
              Send a private message to{' '}
              <span className="text-white font-medium">{ownerName || 'the owner'}</span> to inquire
              about this vehicle.
            </p>
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Your contact details remain private</span>
            </div>
          </div>

          <button
            onClick={handleStartConversation}
            disabled={isStartingConversation}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {isStartingConversation ? 'Starting Conversation...' : 'Send Message'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
            <p className="text-gray-300 text-sm">
              Sign in to send a private message to the owner. Your contact details will remain
              secure.
            </p>
          </div>
          <Link
            href={`/sign-in?callbackUrl=/vehicles/${vehicleId}`}
            className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Sign In to Contact Owner
          </Link>
        </div>
      )}
    </div>
  )
}
