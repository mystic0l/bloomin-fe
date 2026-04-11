import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';

const Cart = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, removeFromCart, updateCartQuantity, user } = useStore();
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/shops');
        const data = await res.json();
        setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };
  
    fetchShops();
  }, []);

  const getProductShopId = (product: Product) => {
    const p = product as Product & { shop_id?: string | number };
    const raw = p.shopId ?? p.shop_id;
    return raw != null && raw !== '' ? String(raw) : '';
  };

  const productImageUrl = (product: Product) => {
    const p = product as Product & { image_url?: string };
    return p.imageUrl ?? p.image_url;
  };

  const productFlavor = (product: Product) => {
    const p = product as Product & { flavor?: string };
    return p.flavor ?? '';
  };

  const maxQuantityOptions = (product: Product, lineQty: number) => {
    const stock = Number((product as Product & { quantity?: number }).quantity);
    const upper =
      Number.isFinite(stock) && stock >= 0 ? Math.max(stock, lineQty) : Math.max(lineQty, 1);
    return Math.min(Math.max(upper, 1), 20);
  };

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
    const shopId = getProductShopId(item.product) || 'unknown';
    if (!acc[shopId]) acc[shopId] = [];
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
          const shop = shops.find((s) => String(s.id) === String(shopId));
          const shopTitle =
            shop?.name ??
            (shopId === 'unknown'
              ? t('common.language') === 'hindi'
                ? 'दुकान'
                : 'Shop'
              : `${t('common.language') === 'hindi' ? 'दुकान' : 'Shop'} #${shopId}`);

          const total = calculateShopTotal(items);

          return (
            <div key={shopId} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{shopTitle}</h2>
                <button
                  onClick={() => handleCheckout(shopId)}
                  disabled={shopId === 'unknown'}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {t('cart.checkout')} (₹{total.toFixed(2)})
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={String(item.product.id)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {productImageUrl(item.product) ? (
                        <img
                          src={productImageUrl(item.product)}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{productFlavor(item.product)}</p>
                        <p className="font-semibold text-gray-900 mt-1">₹{item.product.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQuantity(String(item.product.id), parseInt(e.target.value, 10))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from(
                          { length: maxQuantityOptions(item.product, item.quantity) },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>

                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(String(item.product.id))}
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