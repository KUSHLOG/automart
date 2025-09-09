'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
    id: string
    content: string
    senderId: string
    receiverId: string
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
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [conversationId, setConversationId] = useState<string>('')
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params
            setConversationId(resolvedParams.id)
        }
        getParams()
    }, [params])

    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/sign-in?callbackUrl=/messages')
            return
        }
    }, [session, status, router])

    useEffect(() => {
        if (!conversationId || !session?.user?.email) return

        const fetchConversation = async () => {
            try {
                // Get conversation details first
                const convResponse = await fetch('/api/conversations')
                if (convResponse.ok) {
                    const conversations = await convResponse.json()
                    const currentConv = conversations.find((c: Conversation) => c.id === conversationId)
                    if (currentConv) {
                        setConversation(currentConv)
                    } else {
                        setError('Conversation not found')
                        return
                    }
                }

                // Get messages
                const messagesResponse = await fetch(`/api/conversations/${conversationId}/messages`)
                if (messagesResponse.ok) {
                    const data = await messagesResponse.json()
                    setMessages(data.messages)
                } else {
                    setError('Failed to load messages')
                }
            } catch (err) {
                console.error('Error fetching conversation:', err)
                setError('Failed to load conversation')
            } finally {
                setLoading(false)
            }
        }

        fetchConversation()
    }, [conversationId, session])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newMessage.trim(),
                }),
            })

            if (response.ok) {
                const message = await response.json()
                setMessages(prev => [...prev, message])
                setNewMessage('')
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to send message')
            }
        } catch (err) {
            console.error('Error sending message:', err)
            setError('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString()
        }
    }

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

    if (error && !conversation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-center">
                        {error}
                        <div className="mt-4">
                            <Link
                                href="/messages"
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                Back to Messages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const otherUser = conversation?.buyerId === session.user.id
        ? conversation.buyer
        : conversation?.buyer

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            href="/messages"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Messages
                        </Link>
                    </div>

                    {conversation && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col h-full">
                            {/* Conversation Header */}
                            <div className="flex items-center space-x-4 p-6 border-b border-white/10">
                                <Image
                                    src={conversation.vehicle.imageUrl || '/placeholder-car.svg'}
                                    alt={`${conversation.vehicle.make} ${conversation.vehicle.model}`}
                                    width={60}
                                    height={45}
                                    className="rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-white">
                                        {conversation.vehicle.year} {conversation.vehicle.make} {conversation.vehicle.model}
                                    </h2>
                                    <p className="text-gray-300">
                                        Conversation with {otherUser?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-blue-400 text-sm">
                                        LKR {conversation.vehicle.price.toLocaleString()} • {conversation.vehicle.type.replace('_', ' ')}
                                    </p>
                                </div>
                                <Link
                                    href={`/vehicles/${conversation.vehicle.id}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    View Vehicle
                                </Link>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message, index) => {
                                        const isOwnMessage = message.senderId === session.user.id
                                        const showDate = index === 0 ||
                                            formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt)

                                        return (
                                            <div key={message.id}>
                                                {showDate && (
                                                    <div className="text-center text-gray-400 text-sm py-2">
                                                        {formatDate(message.createdAt)}
                                                    </div>
                                                )}
                                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-700 text-gray-100'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                                                            }`}>
                                                            {formatTime(message.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-6 border-t border-white/10">
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        maxLength={1000}
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                                    >
                                        {sending ? 'Sending...' : 'Send'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
