'use client'

import { Layout } from '@/components/Layout'
import { ProductManagement } from '@/pages/shopkeeper/ProductManagement'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ProductManagementPage() {
  return (
    <Layout>
      <ProtectedRoute role="shopkeeper">
        <ProductManagement />
      </ProtectedRoute>
    </Layout>
  )
}

