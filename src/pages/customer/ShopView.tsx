import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, ShoppingCart, Plus, Minus, Store, MapPin, Truck, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { mapDbProductRow } from '../../utils/mapDbProduct';
import { getDisplayShopName } from '../../utils/transliterateShopName';

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
    if (!shopId) { setShop(null); setShopLoading(false); return; }
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
    if (!shopId) { setProducts([]); return; }
    const fetchProducts = async () => {
      const url = `http://localhost:5000/api/products/${shopId}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((row) => mapDbProductRow(row as Record<string, unknown>))
          : [];
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
  const isHindi = t('common.language') === 'hindi';

  if (!shopId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="card p-8 text-center max-w-xs mx-auto">
          <p className="text-slate-500">{isHindi ? 'अमान्य दुकान लिंक' : 'Invalid shop link'}</p>
        </div>
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

  const isDelivery = (shop?.serviceType ?? shop?.service_type) === 'delivery';

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/customer/shops')}
          className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-xl"
          style={{ color: 'var(--slate-mid)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </button>

        {cartItemCount > 0 && (
          <button
            onClick={() => router.push('/customer/cart')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: 'var(--emerald)', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}
          >
            <ShoppingCart className="w-4 h-4" />
            {t('cart.cart')} ({cartItemCount})
          </button>
        )}
      </div>

      {/* Shop info card */}
      <div className="card p-5 sm:p-7">
        {shopLoading ? (
          <div className="space-y-3">
            <div className="h-7 w-48 rounded-lg bg-slate-100 pulse-soft" />
            <div className="h-4 w-64 rounded-lg bg-slate-100 pulse-soft" />
          </div>
        ) : shop ? (
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--saffron-pale)' }}
            >
              <Store className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--saffron)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {getDisplayShopName(String(shop.name ?? ''), isHindi)}
              </h1>
              <div className="flex items-start gap-1.5 mt-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-500">{shop.address}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-blue capitalize">
                  {shop.type ? shop.type.charAt(0).toUpperCase() + shop.type.slice(1) : ''}
                </span>
                <span
                  className="badge"
                  style={
                    isDelivery
                      ? { background: 'var(--emerald-pale)', color: 'var(--emerald)' }
                      : { background: 'var(--saffron-pale)', color: 'var(--saffron)' }
                  }
                >
                  {isDelivery
                    ? <><Truck className="w-3 h-3 mr-1" />{t('shop.delivery')}</>
                    : <><ShoppingBag className="w-3 h-3 mr-1" />{t('shop.takeout')}</>
                  }
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            {isHindi
              ? `दुकान #${shopId} सूची में नहीं मिली — उत्पाद नीचे दिख सकते हैं`
              : `Shop #${shopId} was not found in the directory — products below may still load.`}
          </p>
        )}
      </div>

      {/* Products */}
      <div className="card p-5 sm:p-7">
        <h2
          className="text-xl sm:text-2xl font-bold text-slate-800 mb-5"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {t('shop.products')}
        </h2>

        {shopProducts.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F8FAFC' }}
            >
              <ShoppingBag className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {isHindi
                ? 'इस दुकान में अभी कोई उत्पाद उपलब्ध नहीं है'
                : 'No products available in this shop yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table-base w-full">
                <thead>
                  <tr>
                    <th>{t('product.name')}</th>
                    <th>{t('product.flavor')}</th>
                    <th>{t('product.price')}</th>
                    <th>{t('product.quantity')}</th>
                    <th>{isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart'}</th>
                  </tr>
                </thead>
                <tbody>
                  {shopProducts.map((product) => {
                    const quantity = quantities[product.id] || 0;
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <span className="font-semibold text-slate-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="text-slate-500">{product.flavor}</td>
                        <td className="font-bold text-slate-800">₹{product.price}</td>
                        <td>
                          {product.quantity > 0 ? (
                            <span className="badge badge-green">{product.quantity}</span>
                          ) : (
                            <span className="badge badge-red">
                              {isHindi ? 'स्टॉक में नहीं' : 'Out of stock'}
                            </span>
                          )}
                        </td>
                        <td>
                          {product.quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center rounded-xl overflow-hidden border border-slate-200">
                                <button
                                  onClick={() => handleQuantityChange(product.id, -1)}
                                  className="p-1.5 hover:bg-slate-50 transition-colors"
                                  disabled={quantity === 0}
                                >
                                  <Minus className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-slate-700">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(product.id, 1)}
                                  className="p-1.5 hover:bg-slate-50 transition-colors"
                                  disabled={quantity >= product.quantity}
                                >
                                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={quantity === 0}
                                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                                style={{ background: quantity > 0 ? 'var(--saffron)' : '#CBD5E1' }}
                              >
                                {t('cart.addToCart')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              {isHindi ? 'उपलब्ध नहीं' : 'Unavailable'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {shopProducts.map((product) => {
                const quantity = quantities[product.id] || 0;
                const inStock = product.quantity > 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100"
                    style={{ background: '#FAFAFA' }}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{product.name}</p>
                          {product.flavor && (
                            <p className="text-xs text-slate-500 mt-0.5">{product.flavor}</p>
                          )}
                        </div>
                        <p className="font-bold text-slate-800 text-sm flex-shrink-0">₹{product.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        {inStock ? (
                          <span className="text-xs text-emerald-600 font-medium">
                            {product.quantity} {isHindi ? 'उपलब्ध' : 'in stock'}
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">
                            {isHindi ? 'स्टॉक में नहीं' : 'Out of stock'}
                          </span>
                        )}
                        {inStock && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 bg-white">
                              <button
                                onClick={() => handleQuantityChange(product.id, -1)}
                                className="px-2 py-1 text-slate-600 active:bg-slate-100"
                                disabled={quantity === 0}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-700">{quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="px-2 py-1 text-slate-600 active:bg-slate-100"
                                disabled={quantity >= product.quantity}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={quantity === 0}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40 active:scale-95"
                              style={{ background: quantity > 0 ? 'var(--saffron)' : '#CBD5E1' }}
                            >
                              {isHindi ? 'जोड़ें' : 'Add'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopView;