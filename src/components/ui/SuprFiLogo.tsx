'use client'

import React from 'react'

interface SuprFiLogoProps {
  className?: string
}

export default function SuprFiLogo({ className = '' }: SuprFiLogoProps) {
  return (
    <span className={className}>
      Supr<span className="text-teal">Fi</span>
    </span>
  )
}
