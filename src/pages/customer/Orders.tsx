"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Package } from 'lucide-react';

const Orders = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentCustomer, user, shops } = useStore();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  const customerOrders = orders;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/customer/shops')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('common.back')}
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('order.myOrders')}
        </h1>

        {customerOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customerOrders.map((order: any) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl p-6"
              >
                <p className="font-bold text-lg">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600">₹{order.total_amount}</p>
                <p className="text-sm text-blue-600">{order.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;