'use client'

import { Layout } from '@/components/Layout'
import ShopSetup  from '@/pages/shopkeeper/ShopSetup'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ShopSetupPage() {
  return (
    <Layout>
      <ProtectedRoute role="shopkeeper">
        <ShopSetup />
      </ProtectedRoute>
    </Layout>
  )
}

