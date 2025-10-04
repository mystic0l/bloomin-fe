'use client'

import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/shopkeeper/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardPage() {
  return (
    <Layout>
      <ProtectedRoute role="shopkeeper">
        <Dashboard />
      </ProtectedRoute>
    </Layout>
  )
}

