'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export default function InfiniteMenu({
  items,
  className,
  speed = 40, // seconds per full loop
}: {
  items: string[]
  className?: string
  speed?: number
}) {
  const row = (
    <ul className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <li
          key={`${t}-${i}`}
          className="whitespace-nowrap text-sm md:text-base text-white/80 hover:text-white transition-colors"
        >
          {t}
        </li>
      ))}
    </ul>
  )

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="flex w-[200%]"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {row}
        {row /* duplicate for seamless loop */}
      </div>
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
    </div>
  )
}
