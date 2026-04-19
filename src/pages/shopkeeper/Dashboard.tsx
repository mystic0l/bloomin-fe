import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Package, ShoppingCart, QrCode, Settings, Plus, Store, MapPin, Truck, ShoppingBag } from 'lucide-react';
import { generateQRCode, downloadQRCode } from '../../utils/qrcode';
import { showNotification, requestNotificationPermission } from '../../utils/notifications';
import { mapDbProductRow } from '../../utils/mapDbProduct';

type Order = {
  id?: number | string;
  shopId?: string;
  shop_id?: number | string;
  status?: 'pending' | 'completed' | string;
  orderNumber?: string | number;
  items?: unknown[];
  created_at?: string;
  total_amount?: number;
  customer_name?: string;
  phone?: string;
  address?: string;
};

function orderShopId(o: Order): string {
  const raw = o.shop_id ?? o.shopId;
  return raw != null && raw !== '' ? String(raw) : '';
}

const Dashboard = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop, products, setProductsForShop } = useStore();
  const [qrCode, setQrCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'qr'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  const isHindi = t('common.language') === 'hindi';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? (data as Order[]) : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!currentShop) { router.push('/shopkeeper/setup'); return; }
    requestNotificationPermission();
    const storefrontUrl = `${window.location.origin}/shop/${currentShop.id}`;
    generateQRCode(storefrontUrl).then(setQrCode);
  }, [currentShop, router]);

  useEffect(() => {
    const latestOrder = orders[0];
    if (
      latestOrder &&
      orderShopId(latestOrder) === String(currentShop?.id ?? '') &&
      (latestOrder.status ?? 'pending') === 'pending'
    ) {
      showNotification(t('order.new'), {
        body: `${t('order.orderNumber')}: #${latestOrder.id}`,
        icon: '/icon-192x192.png',
      });
    }
  }, [orders, currentShop, t]);

  useEffect(() => {
    if (!currentShop?.id) return;
    let cancelled = false;
    const shopId = String(currentShop.id);
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${shopId}`);
        const data = await res.json();
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setProductsForShop(shopId, rows.map((row) => mapDbProductRow(row as Record<string, unknown>)));
      } catch (err) {
        console.error('[Dashboard] load products:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentShop?.id, setProductsForShop]);

  if (!currentShop) return null;

  const shopProducts = products.filter((p) => String(p.shopId) === String(currentShop.id));
  const shopOrders = orders.filter((o) => orderShopId(o) === String(currentShop.id));
  const pendingOrders = shopOrders.filter((o) => (o.status ?? 'pending') === 'pending');

  const handleDownloadQR = () => {
    if (qrCode) downloadQRCode(qrCode, `${currentShop.name}-qr-code.png`);
  };

  const isDelivery = currentShop.serviceType === 'delivery';

  const tabs = [
    { id: 'orders' as const, label: t('shop.orders') },
    { id: 'products' as const, label: t('shop.products') },
    { id: 'qr' as const, label: t('shop.qrCode') },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Shop header card */}
      <div className="card p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--saffron-pale)' }}
            >
              <Store className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--saffron)' }} />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {currentShop.name}
              </h1>
              <div className="flex items-start gap-1.5 mt-1 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-500">{currentShop.address}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-blue capitalize">{currentShop.type}</span>
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
          <button
            onClick={() => router.push('/shopkeeper/settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto"
            style={{ background: '#F8FAFC', color: 'var(--slate-mid)' }}
          >
            <Settings className="w-4 h-4" />
            {t('shop.settings')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#1D4ED8' }} />}
          iconBg="#EFF6FF"
          label={t('shop.products')}
          value={shopProducts.length}
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--saffron)' }} />}
          iconBg="var(--saffron-pale)"
          label={t('order.pending')}
          value={pendingOrders.length}
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--emerald)' }} />}
          iconBg="var(--emerald-pale)"
          label={t('order.completed')}
          value={shopOrders.filter((o) => (o.status ?? '') === 'completed').length}
        />
      </div>

      {/* Tab panel */}
      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3.5 px-2 text-sm font-semibold transition-all whitespace-nowrap min-w-0"
              style={
                activeTab === tab.id
                  ? { color: 'var(--saffron)', borderBottom: '2px solid var(--saffron)', background: 'var(--saffron-pale)' }
                  : { color: 'var(--slate-mid)', borderBottom: '2px solid transparent' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-7">
          {activeTab === 'orders' && (
            <OrdersTab
              orders={shopOrders}
              onOrderStatusUpdated={(orderId, status) => {
                setOrders((prev) =>
                  prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status } : o))
                );
              }}
            />
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title text-lg sm:text-xl">{t('product.manage')}</h2>
                <button
                  onClick={() => router.push('/shopkeeper/products')}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('product.add')}</span>
                  <span className="sm:hidden">{isHindi ? 'जोड़ें' : 'Add'}</span>
                </button>
              </div>

              {shopProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">
                    {isHindi ? 'अभी तक कोई उत्पाद नहीं जोड़ा गया' : 'No products added yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shopProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl"
                      style={{ background: '#F8FAFC' }}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-semibold text-slate-800 text-sm">{product.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{product.flavor}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-800 text-sm">₹{product.price}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('product.quantity')}: {product.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center space-y-5 py-4">
              <h2 className="section-title">{t('shop.qrCode')}</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                {isHindi
                  ? 'ग्राहकों को अपनी दुकान दिखाने के लिए इस QR कोड को साझा करें'
                  : 'Share this QR code to let customers view your shop'}
              </p>
              {qrCode && (
                <div className="space-y-4">
                  <div
                    className="inline-block p-4 rounded-2xl"
                    style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}
                  >
                    <img src={qrCode} alt="Shop QR Code" className="w-48 h-48 sm:w-56 sm:h-56" />
                  </div>
                  <div>
                    <button
                      onClick={handleDownloadQR}
                      className="btn-primary"
                    >
                      <QrCode className="w-4 h-4" />
                      {t('shop.downloadQr')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}

const StatCard = ({ icon, iconBg, label, value }: StatCardProps) => (
  <div className="card p-3.5 sm:p-5">
    <div
      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 sm:mb-3"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <p className="text-slate-500 text-xs sm:text-sm font-medium leading-tight">{label}</p>
    <p
      className="text-2xl sm:text-3xl font-bold text-slate-800 mt-0.5"
      style={{ fontFamily: 'Syne, sans-serif' }}
    >
      {value}
    </p>
  </div>
);

const OrdersTab = ({
  orders,
  onOrderStatusUpdated,
}: {
  orders: Order[];
  onOrderStatusUpdated?: (orderId: string | number, status: string) => void;
}) => {
  const { t } = useTranslation();
  const isHindi = t('common.language') === 'hindi';

  const statusStyle: Record<string, { bg: string; color: string }> = {
    pending:   { bg: '#FFFBEB', color: '#92400E' },
    accepted:  { bg: '#EFF6FF', color: '#1D4ED8' },
    ready:     { bg: '#F5F3FF', color: '#7C3AED' },
    completed: { bg: 'var(--emerald-pale)', color: 'var(--emerald)' },
    cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: '#F8FAFC' }}
        >
          <ShoppingCart className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm">
          {isHindi ? 'अभी तक कोई ऑर्डर नहीं आया' : 'No orders yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = order.status ?? 'pending';
        const style = statusStyle[status] ?? { bg: '#F8FAFC', color: '#475569' };
        const isDone = status === 'completed' || status === 'cancelled';

        return (
          <div
            key={order.id}
            className="rounded-2xl overflow-hidden border border-slate-100"
          >
            {/* Order header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5"
              style={{ background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">Order #{order.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.customer_name}</p>
                {order.phone && <p className="text-xs text-slate-400">{order.phone}</p>}
              </div>
              <span
                className="badge self-start sm:self-auto text-xs"
                style={{ background: style.bg, color: style.color }}
              >
                {t(`order.${status}`)}
              </span>
            </div>

            {/* Order body */}
            <div className="p-4 space-y-3 bg-white">
              {order.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{order.address}</p>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className="space-y-1">
                  {(order.items as any[]).map((item, idx) => (
                    <p key={idx} className="text-xs text-slate-500">
                      {item.product_name} × {item.quantity}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-50">
                <p className="font-bold text-slate-800">
                  {t('order.total')}: ₹{order.total_amount}
                </p>
                {!isDone && (
                  <select
                    value={status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        const res = await fetch(`http://localhost:5000/api/orders/${order.id}/status`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: newStatus }),
                        });
                        if (!res.ok) { console.error('Status update failed:', await res.text()); return; }
                        onOrderStatusUpdated?.(order.id as string | number, newStatus);
                      } catch (err) {
                        console.error('Failed to update status:', err);
                      }
                    }}
                    className="input-base py-2 text-sm w-full sm:w-auto sm:min-w-[160px]"
                  >
                    <option value="pending">{t('order.pending')}</option>
                    <option value="accepted">{t('order.accepted')}</option>
                    <option value="ready">{t('order.ready')}</option>
                    <option value="completed">{t('order.completed')}</option>
                    <option value="cancelled">{t('order.cancelled')}</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;