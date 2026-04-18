'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, CheckCircle, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';

function normalizeRouteShopId(params: ReturnType<typeof useParams>): string | undefined {
  const raw = params?.shopId ?? params?.id;
  if (raw == null || raw === '') return undefined;
  return Array.isArray(raw) ? raw[0] : String(raw);
}

function productShopId(product: Product): string {
  const p = product as Product & { shop_id?: string | number };
  const raw = p.shopId ?? p.shop_id;
  return raw != null && raw !== '' ? String(raw) : '';
}

function productFlavorLine(product: Product): string {
  const p = product as Product & { flavor?: string };
  return p.flavor ?? '';
}

const Checkout = () => {
  const params = useParams();
  const shopId = normalizeRouteShopId(params);
  const router = useRouter();
  const { t } = useTranslation();
  const { user, cart, shops, currentCustomer, clearCartForShop } = useStore();
  const isHindi = t('common.language') === 'hindi';

  const [fetchedShops, setFetchedShops] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/shops');
        const data = await res.json();
        if (!cancelled) setFetchedShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[Checkout] fetch shops:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const shop = useMemo(() => {
    if (!shopId) return undefined;
    const id = String(shopId);
    const fromApi = fetchedShops.find((s) => String(s.id) === id);
    const fromStore = shops.find((s) => String(s.id) === id);
    const raw = fromApi ?? fromStore;
    if (!raw) return undefined;
    const r = raw as Record<string, unknown>;
    return {
      ...raw,
      serviceType: (r.serviceType ?? r.service_type) as 'takeout' | 'delivery' | undefined,
      upiId: r.upiId ?? r.upi_id,
      upiQrUrl: r.upiQrUrl ?? r.upi_qr_url,
    };
  }, [shopId, fetchedShops, shops]);

  const shopCartItems = useMemo(() => {
    if (!shopId) return [];
    const id = String(shopId);
    return cart.filter((item) => productShopId(item.product) === id);
  }, [cart, shopId]);

  const [formData, setFormData] = useState({
    name: currentCustomer?.name || '',
    phone: currentCustomer?.phone || '',
    address: currentCustomer?.defaultAddress || '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'upi_on_delivery',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const total = shopCartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  );

  useEffect(() => {
    if (!shopId) { router.replace('/customer/shops'); return; }
    if (shopCartItems.length === 0) router.replace('/customer/cart');
  }, [shopId, shopCartItems.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth?role=customer'); return; }
    if (!shopId || shopCartItems.length === 0) return;

    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    try {
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          total_amount: total,
          shop_id: Number(shopId),
          items: shopCartItems.map((item) => ({
            product_name: item.product.name,
            quantity: item.quantity,
            price: Number(item.product.price),
            subtotal: Number(item.product.price) * item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) { console.error('[Checkout] order failed:', data); return; }
      console.log('[Checkout] saved:', data);
    } catch (error) {
      console.error('[Checkout] backend error:', error);
      return;
    }

    clearCartForShop(String(shopId));
    setOrderId(orderNumber);
    setOrderPlaced(true);
  };

  if (!shopId) return null;
  if (shopCartItems.length === 0 && !orderPlaced) return null;

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto pb-8">
        <div className="card p-8 sm:p-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--emerald-pale)' }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--emerald)' }} />
          </div>
          <h1 className="section-title text-2xl sm:text-3xl mb-2">
            {isHindi ? 'ऑर्डर सफल!' : 'Order Placed!'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {isHindi
              ? 'आपका ऑर्डर सफलतापूर्वक प्राप्त हो गया है'
              : 'Your order has been received successfully'}
          </p>
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: 'var(--saffron-pale)' }}
          >
            <p className="text-xs text-slate-500 mb-1">{t('order.orderNumber')}</p>
            <p className="text-xl font-bold" style={{ color: 'var(--saffron)', fontFamily: 'Syne, sans-serif' }}>
              {orderId}
            </p>
          </div>
          <p className="text-sm text-slate-500 mb-7">
            {isHindi
              ? '"मेरे ऑर्डर" में अपने ऑर्डर को ट्रैक करें'
              : 'Track your order in "My Orders"'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/customer/orders')}
              className="btn-primary flex-1 justify-center py-3"
            >
              {t('order.myOrders')}
            </button>
            <button
              onClick={() => router.push('/customer/shops')}
              className="px-5 py-3 rounded-xl text-sm font-semibold flex-1 transition-colors"
              style={{ background: '#F1F5F9', color: 'var(--slate-mid)' }}
            >
              {t('customer.browseShops')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showPaymentOptions = shop?.serviceType === 'delivery';
  const showUpiOption = showPaymentOptions && !!(shop?.upiId || shop?.upiQrUrl);

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/customer/cart')}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
          style={{ color: 'var(--slate-mid)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </button>
        <h1 className="section-title text-xl sm:text-2xl">{t('cart.checkout')}</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="card p-5 sm:p-7">
            {!shop && (
              <div
                className="mb-5 p-3.5 rounded-xl text-sm"
                style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}
              >
                {isHindi
                  ? 'दुकान विवरण लोड हो रहा है — आप फिर भी ऑर्डर दे सकते हैं।'
                  : 'Shop details loading — you can still place your order.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {t('common.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {t('common.phone')} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {t('common.address')} *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                  className="input-base resize-none"
                  placeholder={
                    shop?.serviceType === 'delivery'
                      ? (isHindi ? 'डिलीवरी पता' : 'Delivery address')
                      : (isHindi ? 'पिकअप पता' : 'Pickup address')
                  }
                />
              </div>

              {showPaymentOptions && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    {t('customer.paymentMethod')} *
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { val: 'cash_on_delivery', label: t('customer.cashOnDelivery') },
                      ...(showUpiOption ? [{ val: 'upi_on_delivery', label: t('customer.upiOnDelivery') }] : []),
                    ].map((opt) => (
                      <label
                        key={opt.val}
                        className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-colors border"
                        style={
                          formData.paymentMethod === opt.val
                            ? { borderColor: 'var(--saffron)', background: 'var(--saffron-pale)' }
                            : { borderColor: '#E2E8F0', background: 'white' }
                        }
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={opt.val}
                          checked={formData.paymentMethod === opt.val}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                          className="w-4 h-4"
                          style={{ accentColor: 'var(--saffron)' }}
                        />
                        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === 'upi_on_delivery' && !!shop?.upiQrUrl && (
                    <div
                      className="mt-4 p-4 rounded-xl text-center"
                      style={{ background: 'var(--emerald-pale)' }}
                    >
                      <p className="text-xs text-emerald-700 mb-3">
                        {isHindi ? 'डिलीवरी पर इस QR कोड को स्कैन करें' : 'Scan this QR code on delivery'}
                      </p>
                      <img src={String(shop.upiQrUrl)} alt="UPI QR" className="w-28 h-28 mx-auto rounded-lg" />
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="btn-green w-full py-3.5 text-base rounded-2xl mt-2">
                {t('cart.placeOrder')}
              </button>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sm:p-6 lg:sticky lg:top-20">
            <h2 className="font-bold text-slate-800 text-base mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              {t('order.orderDetails')}
            </h2>

            <div className="space-y-3 mb-4">
              {shopCartItems.map((item) => (
                <div key={String(item.product.id)} className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium leading-tight">{item.product.name}</p>
                    {productFlavorLine(item.product) && (
                      <p className="text-xs text-slate-400">{productFlavorLine(item.product)}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">×{item.quantity}</p>
                  </div>
                  <span className="font-semibold text-sm text-slate-800 flex-shrink-0">
                    ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-base">{t('order.total')}</span>
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--saffron)', fontFamily: 'Syne, sans-serif' }}
              >
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;