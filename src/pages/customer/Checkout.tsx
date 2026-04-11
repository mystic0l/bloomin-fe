'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
    return () => {
      cancelled = true;
    };
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
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  useEffect(() => {
    if (!shopId) {
      router.replace('/customer/shops');
      return;
    }
    if (shopCartItems.length === 0) {
      router.replace('/customer/cart');
    }
  }, [shopId, shopCartItems.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth?role=customer');
      return;
    }

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
      if (!response.ok) {
        console.error('[Checkout] order failed:', data);
        return;
      }
      console.log('[Checkout] saved:', data);
    } catch (error) {
      console.error('[Checkout] backend error:', error);
      return;
    }

    clearCartForShop(String(shopId));

    setOrderId(orderNumber);
    setOrderPlaced(true);
  };

  if (!shopId) {
    return null;
  }

  if (shopCartItems.length === 0 && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('common.language') === 'hindi' ? 'ऑर्डर सफल!' : 'Order Successful!'}
          </h1>
          <p className="text-gray-600 mb-2">
            {t('common.language') === 'hindi'
              ? 'आपका ऑर्डर सफलतापूर्वक प्राप्त हो गया है'
              : 'Your order has been received successfully'}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">{t('order.orderNumber')}</p>
            <p className="text-2xl font-bold text-blue-600">{orderId}</p>
          </div>
          <p className="text-gray-600 mb-6">
            {t('common.language') === 'hindi'
              ? 'आप "मेरे ऑर्डर" में अपने ऑर्डर को ट्रैक कर सकते हैं'
              : 'You can track your order in "My Orders"'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/customer/orders')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('order.myOrders')}
            </button>
            <button
              onClick={() => router.push('/customer/shops')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
    <div className="space-y-6">
      <button
        onClick={() => router.push('/customer/cart')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('common.back')}
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('cart.checkout')}</h1>

            {!shop && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                {t('common.language') === 'hindi'
                  ? 'दुकान विवरण लोड हो रहा है या सूची में नहीं है — आप फिर भी ऑर्डर दे सकते हैं।'
                  : 'Shop details are loading or not in the directory — you can still place your order.'}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.phone')} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.address')} *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    shop?.serviceType === 'delivery'
                      ? t('common.language') === 'hindi'
                        ? 'डिलीवरी पता'
                        : 'Delivery address'
                      : t('common.language') === 'hindi'
                        ? 'पिकअप के लिए पता'
                        : 'Address for pickup'
                  }
                />
              </div>

              {showPaymentOptions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('customer.paymentMethod')} *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value as 'cash_on_delivery',
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 font-medium text-gray-900">
                        {t('customer.cashOnDelivery')}
                      </span>
                    </label>

                    {showUpiOption && shop && (
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi_on_delivery"
                          checked={formData.paymentMethod === 'upi_on_delivery'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value as 'upi_on_delivery',
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-3 font-medium text-gray-900">
                          {t('customer.upiOnDelivery')}
                        </span>
                      </label>
                    )}
                  </div>

                  {formData.paymentMethod === 'upi_on_delivery' && !!shop?.upiQrUrl && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        {t('common.language') === 'hindi'
                          ? 'डिलीवरी पर इस QR कोड को स्कैन करें'
                          : 'Scan this QR code on delivery'}
                      </p>
                      <img
                        src={String(shop.upiQrUrl)}
                        alt="UPI QR"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {t('cart.placeOrder')}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('order.orderDetails')}</h2>

            <div className="space-y-3 mb-4">
              {shopCartItems.map((item) => (
                <div key={String(item.product.id)} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} ({productFlavorLine(item.product)}) x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">{t('order.total')}</span>
                <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
