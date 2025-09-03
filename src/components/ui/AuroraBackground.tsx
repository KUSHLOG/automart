'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type Props = React.PropsWithChildren<{
  className?: string
  opacity?: number // 0..1
  blur?: string // e.g. '50px'
}>

export default function AuroraBackground({
  className,
  opacity = 0.8,
  blur = '60px',
  children,
}: Props) {
  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      {/* Aurora layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute size-[60vw] rounded-full blur-3xl opacity-60"
          style={{
            left: '-10%',
            top: '-10%',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.8) 0%, rgba(99,102,241,0) 70%)',
            filter: `blur(${blur})`,
            opacity,
            animation: 'aurora-float 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute size-[55vw] rounded-full blur-3xl opacity-60"
          style={{
            right: '-15%',
            top: '-5%',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(236,72,153,0.8) 0%, rgba(236,72,153,0) 70%)',
            filter: `blur(${blur})`,
            opacity,
            animation: 'aurora-float 22s ease-in-out infinite',
            animationDelay: '-.5s',
          }}
        />
        <div
          className="absolute size-[50vw] rounded-full blur-3xl opacity-60"
          style={{
            left: '5%',
            bottom: '-15%',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(34,197,94,0.8) 0%, rgba(34,197,94,0) 70%)',
            filter: `blur(${blur})`,
            opacity,
            animation: 'aurora-float 26s ease-in-out infinite',
            animationDelay: '-2s',
          }}
        />
        <div
          className="absolute size-[45vw] rounded-full blur-3xl opacity-60"
          style={{
            right: '0%',
            bottom: '-10%',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(56,189,248,0.8) 0%, rgba(56,189,248,0) 70%)',
            filter: `blur(${blur})`,
            opacity,
            animation: 'aurora-float 30s ease-in-out infinite',
            animationDelay: '-4s',
          }}
        />
        {/* subtle dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
      </div>
      {children}
    </div>
  )
}
