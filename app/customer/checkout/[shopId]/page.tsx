'use client'

import { Layout } from '@/components/Layout'
import { Checkout } from '@/pages/customer/Checkout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function CheckoutPage() {
  return (
    <Layout>
      <ProtectedRoute role="customer">
        <Checkout />
      </ProtectedRoute>
    </Layout>
  )
}

