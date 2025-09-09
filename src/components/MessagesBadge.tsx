'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function MessagesBadge() {
    const { data: session } = useSession()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!session?.user?.id) return

        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/api/messages/unread-count')
                if (response.ok) {
                    const data = await response.json()
                    setUnreadCount(data.unreadCount)
                }
            } catch (error) {
                console.error('Error fetching unread count:', error)
            }
        }

        fetchUnreadCount()

        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [session])

    if (!session || unreadCount === 0) {
        return null
    }

    return (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    )
}
