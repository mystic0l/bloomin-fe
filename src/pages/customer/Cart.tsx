import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';

 const Cart = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, shops, removeFromCart, updateCartQuantity, user } = useStore();
  const [checkoutShopId, setCheckoutShopId] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/customer/shops')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.emptyCart')}</h2>
          <p className="text-gray-600 mb-6">
            {t('common.language') === 'hindi'
              ? 'खरीदारी शुरू करने के लिए दुकानों को ब्राउज़ करें'
              : 'Browse shops to start shopping'}
          </p>
          <button
            onClick={() => router.push('/customer/shops')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('customer.browseShops')}
          </button>
        </div>
      </div>
    );
  }

  const cartByShop = cart.reduce((acc, item) => {
    const shopId = item.product.shopId;
    if (!acc[shopId]) {
      acc[shopId] = [];
    }
    acc[shopId].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const calculateShopTotal = (items: typeof cart) => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = (shopId: string) => {
    if (!user) {
      router.push('/auth?role=customer');
      return;
    }
    setCheckoutShopId(shopId);
    router.push(`/customer/checkout/${shopId}`);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('cart.cart')}</h1>

        {Object.entries(cartByShop).map(([shopId, items]) => {
          const shop = shops.find((s) => s.id === shopId);
          if (!shop) return null;

          const total = calculateShopTotal(items);

          return (
            <div key={shopId} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{shop.name}</h2>
                <button
                  onClick={() => handleCheckout(shopId)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('cart.checkout')} (₹{total.toFixed(2)})
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.flavor}</p>
                        <p className="font-semibold text-gray-900 mt-1">₹{item.product.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQuantity(item.product.id, parseInt(e.target.value))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: Math.min(item.product.quantity, 20) }, (_, i) => i + 1).map(
                          (num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          )
                        )}
                      </select>

                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Cart;