"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Package, MapPin } from 'lucide-react';

const Orders = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentCustomer, user, shops } = useStore();
  const [orders, setOrders] = useState([]);
  const isHindi = t('common.language') === 'hindi';

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

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: '#FFFBEB', color: '#92400E', label: t('order.pending') },
    accepted:  { bg: '#EFF6FF', color: '#1D4ED8', label: t('order.accepted') },
    ready:     { bg: '#F5F3FF', color: '#7C3AED', label: t('order.ready') },
    completed: { bg: 'var(--emerald-pale)', color: 'var(--emerald)', label: t('order.completed') },
    cancelled: { bg: '#FEF2F2', color: '#DC2626', label: t('order.cancelled') },
  };

  const customerOrders = orders;

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/customer/shops')}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
          style={{ color: 'var(--slate-mid)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </button>
        <h1 className="section-title text-xl sm:text-2xl">{t('order.myOrders')}</h1>
      </div>

      <div className="card p-5 sm:p-7">
        {customerOrders.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#F8FAFC' }}
            >
              <Package className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              {isHindi ? 'अभी तक कोई ऑर्डर नहीं' : 'No orders yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {isHindi ? 'कुछ खरीदारी करें!' : 'Go shop something!'}
            </p>
            <button
              onClick={() => router.push('/customer/shops')}
              className="btn-primary mt-5 text-sm"
            >
              {t('customer.browseShops')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {customerOrders.map((order: any) => {
              const status = order.status ?? 'pending';
              const style = statusStyle[status] ?? { bg: '#F8FAFC', color: '#475569', label: status };

              return (
                <div
                  key={order.id}
                  className="rounded-2xl overflow-hidden border border-slate-100"
                >
                  {/* Header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3.5"
                    style={{ background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">
                          {order.customer_name}
                        </p>
                        <span className="text-xs text-slate-400">· #{order.id}</span>
                      </div>
                    </div>
                    <span
                      className="badge self-start sm:self-auto"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 bg-white space-y-2.5">
                    {order.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-500">{order.address}</p>
                      </div>
                    )}

                    {order.items && order.items.length > 0 && (
                      <div className="space-y-1">
                        {order.items.map((item: any, idx: number) => (
                          <p key={idx} className="text-xs text-slate-500">
                            {item.product_name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 mt-2">
                      <span className="text-xs text-slate-400">
                        {isHindi ? 'कुल राशि' : 'Total amount'}
                      </span>
                      <span className="font-bold text-sm text-slate-800">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;