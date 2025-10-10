'use client'

import { Layout } from '@/components/Layout'
import Orders from "@/pages/customer/Orders";
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function OrdersPage() {
  return (
    <Layout>
      <ProtectedRoute role="customer">
        <Orders />
      </ProtectedRoute>
    </Layout>
  )
}

