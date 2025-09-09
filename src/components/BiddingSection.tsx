'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Bidder {
    id: string
    name: string | null
    email: string
    password: string
    phone: string | null
    address: string | null
    nic: string | null
    createdAt: Date
    updatedAt: Date
}

interface Bid {
    id: string
    amount: number
    createdAt: Date
    bidderId: string
    vehicleId: string
    bidder: Bidder
}

interface BiddingSectionProps {
    vehicleId: string
    highestBid: Bid | null
    biddingEnd?: Date | null
    isOwner: boolean
}

export default function BiddingSection({
    vehicleId,
    highestBid,
    biddingEnd,
    isOwner
}: BiddingSectionProps) {
    const { data: session } = useSession()
    const [bidAmount, setBidAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showBidForm, setShowBidForm] = useState(false)

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const amount = parseFloat(bidAmount)

            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid bid amount')
                return
            }

            if (highestBid && amount <= highestBid.amount) {
                setError(`Bid must be higher than current highest bid of LKR ${highestBid.amount.toLocaleString()}`)
                return
            }

            const response = await fetch('/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vehicleId,
                    amount,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(`Bid placed successfully! Your bid: LKR ${amount.toLocaleString()}`)
                setBidAmount('')
                setShowBidForm(false)
                // Reload the page to show updated bid
                window.location.reload()
            } else {
                setError(data.error || 'Failed to place bid')
            }
        } catch (err) {
            console.error('Error placing bid:', err)
            setError('Failed to place bid. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const isExpired = biddingEnd && new Date() > new Date(biddingEnd)

    if (isOwner) {
        return (
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700">
                <h3 className="text-xl font-semibold text-white mb-4">Live Bidding</h3>
                {highestBid ? (
                    <div className="space-y-2">
                        <p className="text-gray-300">
                            Current highest bid:{' '}
                            <span className="text-blue-400 font-bold text-xl">
                                LKR {highestBid.amount.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-gray-400 text-sm">
                            by {highestBid.bidder.name || 'Anonymous'}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-300">No bids yet</p>
                )}
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-300 text-sm">You cannot bid on your own vehicle</p>
                </div>
                {biddingEnd && (
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        Bidding ends: {new Date(biddingEnd).toLocaleDateString()}
                    </p>
                )}
            </div>
        )
    }

    if (!session) {
        return (
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700">
                <h3 className="text-xl font-semibold text-white mb-4">Live Bidding</h3>
                {highestBid ? (
                    <div className="space-y-2">
                        <p className="text-gray-300">
                            Current highest bid:{' '}
                            <span className="text-blue-400 font-bold text-xl">
                                LKR {highestBid.amount.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-gray-400 text-sm">
                            by {highestBid.bidder.name || 'Anonymous'}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-300">No bids yet - be the first to bid!</p>
                )}
                <Link
                    href={`/sign-in?callbackUrl=/vehicles/${vehicleId}`}
                    className="block w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-center"
                >
                    Sign In to Bid
                </Link>
                {biddingEnd && (
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        Bidding ends: {new Date(biddingEnd).toLocaleDateString()}
                    </p>
                )}
            </div>
        )
    }

    if (isExpired) {
        return (
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Bidding Ended</h3>
                {highestBid ? (
                    <div className="space-y-2">
                        <p className="text-gray-300">
                            Winning bid:{' '}
                            <span className="text-yellow-400 font-bold text-xl">
                                LKR {highestBid.amount.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-gray-400 text-sm">
                            by {highestBid.bidder.name || 'Anonymous'}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-300">No bids were placed</p>
                )}
                <div className="mt-4 p-3 bg-red-900/50 rounded-lg">
                    <p className="text-red-300 text-sm">Bidding has ended</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700">
            <h3 className="text-xl font-semibold text-white mb-4">Live Bidding</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                    <p className="text-green-300 text-sm">{success}</p>
                </div>
            )}

            {highestBid ? (
                <div className="space-y-2 mb-4">
                    <p className="text-gray-300">
                        Current highest bid:{' '}
                        <span className="text-blue-400 font-bold text-xl">
                            LKR {highestBid.amount.toLocaleString()}
                        </span>
                    </p>
                    <p className="text-gray-400 text-sm">
                        by {highestBid.bidder.name || 'Anonymous'}
                    </p>
                </div>
            ) : (
                <p className="text-gray-300 mb-4">No bids yet - be the first to bid!</p>
            )}

            {showBidForm ? (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-2">
                            Your Bid Amount (LKR)
                        </label>
                        <input
                            type="number"
                            id="bidAmount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={highestBid ? highestBid.amount + 1 : 1}
                            step="1000"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Minimum: LKR ${(highestBid ? highestBid.amount + 1000 : 1000).toLocaleString()}`}
                            required
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            {isSubmitting ? 'Placing Bid...' : 'Submit Bid'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowBidForm(false)
                                setBidAmount('')
                                setError('')
                                setSuccess('')
                            }}
                            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                    Place Your Bid
                </button>
            )}

            {biddingEnd && (
                <p className="text-gray-400 text-sm mt-2 text-center">
                    Bidding ends: {new Date(biddingEnd).toLocaleDateString()}
                </p>
            )}
        </div>
    )
}
