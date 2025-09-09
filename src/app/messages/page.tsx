'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: string
    isRead: boolean
    sender: {
        id: string
        name: string | null
        email: string
    }
}

interface Conversation {
    id: string
    vehicleId: string
    buyerId: string
    sellerId: string
    createdAt: string
    updatedAt: string
    isActive: boolean
    vehicle: {
        id: string
        make: string
        model: string
        year: number
        imageUrl: string
        price: number
        type: string
    }
    buyer: {
        id: string
        name: string | null
        email: string
    }
    seller: {
        id: string
        name: string | null
        email: string
    }
    otherUser: {
        id: string
        name: string | null
        email: string
    }
    lastMessage: Message | null
    unreadCount: number
}

export default function MessagesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/sign-in?callbackUrl=/messages')
            return
        }
    }, [session, status, router])

    useEffect(() => {
        if (!session?.user?.email) return

        const fetchConversations = async () => {
            try {
                const response = await fetch('/api/conversations')
                if (response.ok) {
                    const data = await response.json()
                    setConversations(data)
                } else {
                    setError('Failed to load conversations')
                }
            } catch (err) {
                console.error('Error fetching conversations:', err)
                setError('Failed to load conversations')
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [session])

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`

        return date.toLocaleDateString()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Messages</h1>
                        <p className="text-gray-300">Communicate with vehicle owners and potential buyers</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Conversations List */}
                    {conversations.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                            <div className="mb-6">
                                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-4">No conversations yet</h3>
                            <p className="text-gray-300 mb-6">
                                Start a conversation by contacting a vehicle owner or responding to buyer inquiries.
                            </p>
                            <Link
                                href="/vehicles"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Browse Vehicles
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                            <div className="divide-y divide-white/10">
                                {conversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={`/messages/${conversation.id}`}
                                        className="block p-6 hover:bg-white/5 transition-all duration-200"
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Vehicle Image */}
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={conversation.vehicle.imageUrl || '/placeholder-car.svg'}
                                                    alt={`${conversation.vehicle.make} ${conversation.vehicle.model}`}
                                                    width={80}
                                                    height={60}
                                                    className="rounded-lg object-cover"
                                                />
                                            </div>

                                            {/* Conversation Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-semibold text-white truncate">
                                                        {conversation.vehicle.year} {conversation.vehicle.make} {conversation.vehicle.model}
                                                    </h3>
                                                    <div className="flex items-center space-x-3">
                                                        {conversation.unreadCount > 0 && (
                                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                {conversation.unreadCount}
                                                            </span>
                                                        )}
                                                        <span className="text-gray-400 text-sm">
                                                            {conversation.lastMessage
                                                                ? formatTimeAgo(conversation.lastMessage.createdAt)
                                                                : formatTimeAgo(conversation.createdAt)
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-gray-300">
                                                        <span className="text-sm">
                                                            Conversation with {conversation.otherUser.name || 'Anonymous'}
                                                        </span>
                                                        <div className="text-blue-400 text-sm font-medium">
                                                            LKR {conversation.vehicle.price.toLocaleString()} • {conversation.vehicle.type.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {conversation.lastMessage && (
                                                    <p className="text-gray-400 text-sm mt-2 truncate">
                                                        {conversation.lastMessage.senderId === session.user.id ? 'You: ' : ''}
                                                        {conversation.lastMessage.content}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex-shrink-0">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
