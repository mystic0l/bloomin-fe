import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Trash2, ShoppingCart, Store } from 'lucide-react';
import { Product } from '../../types';

const Cart = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, removeFromCart, updateCartQuantity, user } = useStore();
  const [shops, setShops] = useState<any[]>([]);
  const isHindi = t('common.language') === 'hindi';

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
    const upper = Number.isFinite(stock) && stock >= 0 ? Math.max(stock, lineQty) : Math.max(lineQty, 1);
    return Math.min(Math.max(upper, 1), 20);
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-4 pb-8">
        <button
          onClick={() => router.push('/customer/shops')}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          style={{ color: 'var(--slate-mid)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="card p-12 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--saffron-pale)' }}
          >
            <ShoppingCart className="w-7 h-7" style={{ color: 'var(--saffron)' }} />
          </div>
          <h2 className="section-title text-xl mb-2">{t('cart.emptyCart')}</h2>
          <p className="text-sm text-slate-500 mb-6">
            {isHindi ? 'खरीदारी शुरू करने के लिए दुकानों को ब्राउज़ करें' : 'Browse shops to start shopping'}
          </p>
          <button
            onClick={() => router.push('/customer/shops')}
            className="btn-primary"
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

  const calculateShopTotal = (items: typeof cart) =>
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = (shopId: string) => {
    if (!user) { router.push('/auth?role=customer'); return; }
    router.push(`/customer/checkout/${shopId}`);
  };

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
        <h1 className="section-title text-xl sm:text-2xl">{t('cart.cart')}</h1>
      </div>

      <div className="space-y-5">
        {Object.entries(cartByShop).map(([shopId, items]) => {
          const shop = shops.find((s) => String(s.id) === String(shopId));
          const shopTitle =
            shop?.name ??
            (shopId === 'unknown'
              ? (isHindi ? 'दुकान' : 'Shop')
              : `${isHindi ? 'दुकान' : 'Shop'} #${shopId}`);
          const total = calculateShopTotal(items);

          return (
            <div key={shopId} className="card overflow-hidden">
              {/* Shop header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                style={{ background: 'var(--saffron-pale)', borderBottom: '1px solid rgba(255,107,53,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {shopTitle}
                  </h2>
                </div>
                <button
                  onClick={() => handleCheckout(shopId)}
                  disabled={shopId === 'unknown'}
                  className="btn-green text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {t('cart.checkout')} · ₹{total.toFixed(2)}
                </button>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-50">
                {items.map((item) => {
                  const imgUrl = productImageUrl(item.product);
                  const flavor = productFlavor(item.product);
                  return (
                    <div
                      key={String(item.product.id)}
                      className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5"
                    >
                      {imgUrl && (
                        <img
                          src={imgUrl}
                          alt={item.product.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{item.product.name}</h3>
                        {flavor && <p className="text-xs text-slate-500 mt-0.5">{flavor}</p>}
                        <p className="font-bold text-sm mt-1" style={{ color: 'var(--saffron)' }}>
                          ₹{item.product.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(String(item.product.id), parseInt(e.target.value, 10))
                          }
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none"
                          style={{ background: 'white' }}
                        >
                          {Array.from(
                            { length: maxQuantityOptions(item.product, item.quantity) },
                            (_, i) => i + 1
                          ).map((num) => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>

                        <div className="text-right hidden sm:block min-w-[60px]">
                          <p className="font-bold text-sm text-slate-800">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(String(item.product.id))}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#EF4444', background: '#FEF2F2' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total bar */}
              <div
                className="flex items-center justify-between px-5 py-3 border-t border-slate-100"
                style={{ background: '#FAFAFA' }}
              >
                <span className="text-sm text-slate-500 font-medium">
                  {items.length} {isHindi ? 'वस्तुएं' : 'items'}
                </span>
                <span className="font-bold text-base text-slate-800">
                  {t('order.total')}: ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cart;