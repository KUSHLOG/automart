'use client'

import React from 'react'

export default function BlobCursor({
  size = 48,
  stiffness = 0.15, // 0..1 higher = snappier
  hideOnTouch = true,
}: {
  size?: number
  stiffness?: number
  hideOnTouch?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const target = React.useRef({ x: 0, y: 0 })
  const pos = React.useRef({ x: 0, y: 0 })
  const raf = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    const el = ref.current!
    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX - size / 2
      target.current.y = e.clientY - size / 2
    }
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * stiffness
      pos.current.y += (target.current.y - pos.current.y) * stiffness
      el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      raf.current = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [size, stiffness])

  React.useEffect(() => {
    if (!hideOnTouch) return
    const el = ref.current!
    const onTouch = () => (el.style.display = 'none')
    const onMouse = () => (el.style.display = '')
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('mousemove', onMouse)
    return () => {
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [hideOnTouch])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(40% 40% at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 100%)',
        mixBlendMode: 'difference',
        filter: 'blur(1px)',
        transition: 'background 120ms',
      }}
    />
  )
}
