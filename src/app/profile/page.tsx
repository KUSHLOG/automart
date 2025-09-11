'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserProfile {
    id: string
    name: string | null
    email: string
    phone: string | null
    address: string | null
}

export default function ProfilePage() {
    const { data: session, status, update } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Form state
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/sign-in?callbackUrl=/profile')
            return
        }
    }, [session, status, router])

    // Fetch user profile
    useEffect(() => {
        if (!session?.user?.email) return

        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile')
                if (response.ok) {
                    const userData = await response.json()
                    setProfile(userData)
                    setName(userData.name || '')
                    setPhone(userData.phone || '')
                    setAddress(userData.address || '')
                } else {
                    setError('Failed to load profile')
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')
        setError('')

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim() || null,
                    phone: phone.trim() || null,
                    address: address.trim() || null,
                }),
            })

            if (response.ok) {
                const updatedProfile = await response.json()
                setProfile(updatedProfile)
                setMessage('Profile updated successfully!')

                // Update the session with new user data
                await update({
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                })

                setTimeout(() => setMessage(''), 3000)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to update profile')
            }
        } catch (err) {
            console.error('Error updating profile:', err)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!session) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
                        <p className="text-gray-300">Manage your personal information and contact details</p>
                    </div>

                    {/* Profile Form */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                        {message && (
                            <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg mb-6">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={profile?.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your mobile number (e.g., +94 77 123 4567)"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                                    Home Address
                                </label>
                                <textarea
                                    id="address"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Enter your home address"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                                >
                                    {saving ? 'Updating Profile...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">User ID:</span>
                                <span className="text-white font-mono">{profile?.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Account Created:</span>
                                <span className="text-white">Member since registration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
