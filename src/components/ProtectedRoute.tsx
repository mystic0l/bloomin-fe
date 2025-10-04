'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  role: 'shopkeeper' | 'customer'
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, userRole } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(`/auth?role=${role}`)
      return
    }

    if (userRole !== role) {
      router.push('/')
      return
    }
  }, [user, userRole, role, router])

  if (!user || userRole !== role) {
    return null
  }

  return <>{children}</>
}

