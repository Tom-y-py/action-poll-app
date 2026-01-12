'use client'

import { useEffect, useState } from 'react'

export function AdminFlag({ secret }: { secret: string }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Defer state update to avoid React warning
    const timeout = setTimeout(() => {
      const hash = window.location.hash
      if (hash.includes(`admin=${secret}`)) {
        setIsAdmin(true)
      }
    }, 0)

    return () => clearTimeout(timeout)
  }, [secret])

  return isAdmin
}
