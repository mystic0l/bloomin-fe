"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Order, OrderItem } from '../../types';

 const Checkout = () => {
  const params = useParams();
  const shopId = params?.shopId as string;
  const router = useRouter();
  const { t } = useTranslation();
  const { user, cart, shops, currentCustomer, addOrder, clearCart } = useStore();

  const [formData, setFormData] = useState({
    name: currentCustomer?.name || '',
    phone: currentCustomer?.phone || '',
    address: currentCustomer?.defaultAddress || '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'upi_on_delivery',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [redirect, setRedirect] = useState<null | string>(null); // new redirect state

  const shop = shops.find((s) => s.id === shopId);
  const shopCartItems = cart.filter((item) => item.product.shopId === shopId);
  const total = shopCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // ✅ useEffect for redirects
  useEffect(() => {
    if (!shopId) setRedirect("/customer/shops");
    else if (!shop || shopCartItems.length === 0) setRedirect("/customer/cart");

    if (redirect) {
      router.push(redirect);
    }
  }, [shopId, shop, shopCartItems.length, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setRedirect("/auth?role=customer");
      return;
    }
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const orderItems: OrderItem[] = shopCartItems.map((item) => ({
      id: Math.random().toString(36).substring(7),
      productId: item.product.id,
      productName: item.product.name,
      productFlavor: item.product.flavor,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
    }));

    const order: Order = {
      id: Math.random().toString(36).substring(7),
      orderNumber,
      shopId,
      customerId: currentCustomer?.id || user.id,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      totalAmount: total,
      items: orderItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    try {
      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          total_amount: total,
          items: shopCartItems.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            subtotal: item.product.price * item.quantity
          }))
        })
      });
    
      const data = await response.json();
      console.log("Saved to backend:", data);
    } catch (error) {
      console.error("Backend error:", error);
    }

      clearCart();

    setOrderId(orderNumber);
    setOrderPlaced(true);
  };

 if (redirect) return null;


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
  const showUpiOption = showPaymentOptions && (shop?.upiId || shop?.upiQrUrl);

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

                    {showUpiOption && (
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

                  {formData.paymentMethod === 'upi_on_delivery' && shop.upiQrUrl && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        {t('common.language') === 'hindi'
                          ? 'डिलीवरी पर इस QR कोड को स्कैन करें'
                          : 'Scan this QR code on delivery'}
                      </p>
                      <img
                        src={shop.upiQrUrl}
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
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} ({item.product.flavor}) x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
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