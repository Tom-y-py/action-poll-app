'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyLink() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-200"
    >
      {copied ? (
        <>
          <Check size={14} /> Copied!
        </>
      ) : (
        <>
          <Copy size={14} /> Copy Invite Link
        </>
      )}
    </button>
  )
}