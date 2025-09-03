'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Item = { label: string; href: string }

export default function FlowingMenu({ items, className }: { items: Item[]; className?: string }) {
  const pathname = usePathname()
  const [hovered, setHovered] = React.useState<string | null>(null)

  return (
    <nav className={cn('relative flex items-center gap-6', className)}>
      {items.map(it => {
        const active = pathname === it.href
        return (
          <div
            key={it.href}
            onMouseEnter={() => setHovered(it.href)}
            onMouseLeave={() => setHovered(null)}
            className="relative"
          >
            <Link
              href={it.href}
              className={cn(
                'px-1 py-0.5 text-sm md:text-base',
                active ? 'text-white' : 'text-white/80 hover:text-white'
              )}
            >
              {it.label}
            </Link>

            {(hovered === it.href || active) && (
              <motion.div
                layoutId="flow-underline"
                className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-white/80"
                transition={{ type: 'spring', stiffness: 450, damping: 40 }}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
