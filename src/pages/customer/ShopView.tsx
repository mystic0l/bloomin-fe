import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../../types';

function normalizeRouteShopId(params: ReturnType<typeof useParams>): string | undefined {
  const raw = params?.shopId ?? params?.id;
  if (raw == null || raw === '') return undefined;
  return Array.isArray(raw) ? raw[0] : String(raw);
}

const ShopView = () => {
  const params = useParams();
  const shopId = normalizeRouteShopId(params);
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, addToCart } = useStore();
  const [shop, setShop] = useState<any>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    console.log('[ShopView] shopId from route:', shopId);
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      setShop(null);
      setShopLoading(false);
      return;
    }

    const fetchShop = async () => {
      setShopLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/shops');
        const data = await res.json();
        const found = data.find((s: any) => String(s.id) === String(shopId));
        setShop(found ?? null);
      } catch (err) {
        console.error('Error fetching shop:', err);
        setShop(null);
      } finally {
        setShopLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      const url = `http://localhost:5000/api/products/${shopId}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        console.log('[ShopView] fetched products for shopId', shopId, ':', list);
        setProducts(list);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [shopId]);

  const shopProducts = products;

  if (!shopId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {t('common.language') === 'hindi' ? 'अमान्य दुकान लिंक' : 'Invalid shop link'}
        </p>
      </div>
    );
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = quantities[productId] || 0;
    const newQuantity = Math.max(0, current + delta);
    setQuantities({ ...quantities, [productId]: newQuantity });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    setQuantities({ ...quantities, [product.id]: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/customer/shops')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        {cartItemCount > 0 && (
          <button
            onClick={() => router.push('/customer/cart')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {t('cart.cart')} ({cartItemCount})
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {shopLoading ? (
          <p className="text-gray-500">{t('common.language') === 'hindi' ? 'लोड हो रहा है…' : 'Loading shop…'}</p>
        ) : shop ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
            <p className="text-gray-600 mb-4">{shop.address}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {shop.type
                  ? shop.type.charAt(0).toUpperCase() + shop.type.slice(1)
                  : ''}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {(shop.serviceType ?? shop.service_type) === 'delivery'
                  ? t('shop.delivery')
                  : t('shop.takeout')}
              </span>
            </div>
          </>
        ) : (
          <p className="text-gray-500">
            {t('common.language') === 'hindi'
              ? `दुकान #${shopId} सूची में नहीं मिली — उत्पाद नीचे दिख सकते हैं`
              : `Shop #${shopId} was not found in the directory — products below may still load.`}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('shop.products')}</h2>

        {shopProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {t('common.language') === 'hindi'
              ? 'इस दुकान में अभी कोई उत्पाद उपलब्ध नहीं है'
              : 'No products available in this shop yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('product.name')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('product.flavor')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('product.price')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('product.quantity')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {t('common.language') === 'hindi' ? 'कार्ट में जोड़ें' : 'Add to Cart'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {shopProducts.map((product) => {
                  const quantity = quantities[product.id] || 0;
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{product.flavor}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">₹{product.price}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {product.quantity > 0 ? (
                          <span className="text-green-600">{product.quantity}</span>
                        ) : (
                          <span className="text-red-600">
                            {t('common.language') === 'hindi' ? 'स्टॉक में नहीं' : 'Out of stock'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {product.quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(product.id, -1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={quantity === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={quantity >= product.quantity}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={quantity === 0}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {t('cart.addToCart')}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {t('common.language') === 'hindi' ? 'उपलब्ध नहीं' : 'Unavailable'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ShopView;