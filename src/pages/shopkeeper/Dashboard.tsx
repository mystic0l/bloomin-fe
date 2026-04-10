import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Package, ShoppingCart, QrCode, Settings, Plus } from 'lucide-react';
import { generateQRCode, downloadQRCode } from '../../utils/qrcode';
import { showNotification, requestNotificationPermission } from '../../utils/notifications';

type Order = {
  id?: number | string;
  shopId?: string;
  status?: 'pending' | 'completed' | string;
  orderNumber?: string | number;
  items?: unknown[];
  created_at?: string;
  total_amount?: number;
  customer_name?: string;
  phone?: string;
  address?: string;
};

const Dashboard = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop, products } = useStore();
  const [qrCode, setQrCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'qr'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
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
    if (!currentShop) {
      router.push('/shopkeeper/setup');
      return;
    }

    requestNotificationPermission();

    const storefrontUrl = `${window.location.origin}/shop/${currentShop.id}`;
    generateQRCode(storefrontUrl).then(setQrCode);
  }, [currentShop, router]);

  useEffect(() => {
    const latestOrder = orders[orders.length - 1];
    if (latestOrder && latestOrder.shopId === currentShop?.id && latestOrder.status === 'pending') {
      showNotification(t('order.new'), {
        body: `${t('order.orderNumber')}: ${latestOrder.orderNumber}`,
        icon: '/icon-192x192.png',
      });
    }
  }, [orders, currentShop, t]);

  if (!currentShop) return null;

  const shopProducts = products.filter((p) => p.shopId === currentShop.id);
  const shopOrders = orders;
  const pendingOrders = shopOrders.filter((o) => o.status === 'pending');

  const handleDownloadQR = () => {
    if (qrCode) {
      downloadQRCode(qrCode, `${currentShop.name}-qr-code.png`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentShop.name}</h1>
            <p className="text-gray-600 mt-1">{currentShop.address}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {currentShop.type}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {currentShop.serviceType === 'delivery' ? t('shop.delivery') : t('shop.takeout')}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push('/shopkeeper/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            {t('shop.settings')}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          icon={<Package className="w-8 h-8 text-blue-600" />}
          label={t('shop.products')}
          value={shopProducts.length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<ShoppingCart className="w-8 h-8 text-orange-600" />}
          label={t('order.pending')}
          value={pendingOrders.length}
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={<ShoppingCart className="w-8 h-8 text-green-600" />}
          label={t('order.completed')}
          value={shopOrders.filter((o) => o.status === 'completed').length}
          bgColor="bg-green-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {t('shop.orders')}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {t('shop.products')}
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'qr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {t('shop.qrCode')}
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'orders' && (
            <OrdersTab orders={shopOrders} />
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('product.manage')}</h2>
                <button
                  onClick={() => router.push('/shopkeeper/products')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('product.add')}
                </button>
              </div>
              {shopProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t('common.language') === 'hindi'
                    ? 'अभी तक कोई उत्पाद नहीं जोड़ा गया'
                    : 'No products added yet'}
                </p>
              ) : (
                <div className="space-y-4">
                  {shopProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.flavor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{product.price}</p>
                        <p className="text-sm text-gray-600">
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
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('shop.qrCode')}</h2>
              <p className="text-gray-600">
                {t('common.language') === 'hindi'
                  ? 'ग्राहकों को अपनी दुकान दिखाने के लिए इस QR कोड को साझा करें'
                  : 'Share this QR code to let customers view your shop'}
              </p>
              {qrCode && (
                <>
                  <img src={qrCode} alt="Shop QR Code" className="mx-auto w-64 h-64" />
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <QrCode className="w-5 h-5" />
                    {t('shop.downloadQr')}
                  </button>
                </>
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
  label: string;
  value: number;
  bgColor: string;
}

const StatCard = ({ icon, label, value, bgColor }: StatCardProps) => (
  <div className={`${bgColor} rounded-xl p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const OrdersTab = ({ orders }: { orders: any[] }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        {t('common.language') === 'hindi'
          ? 'अभी तक कोई ऑर्डर नहीं आया'
          : 'No orders yet'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold text-lg text-gray-900">Order #{order.id}</p>
              <p className="text-sm text-gray-600">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.phone}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {t(`order.${order.status}`)}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">{t('common.address')}:</p>
            <p className="text-gray-900">{order.address}</p>
          </div>

          <div className="mt-3">
            {order.items?.map((item: any, index: number) => (
              <p key={index} className="text-sm text-gray-600">
                {item.product_name} × {item.quantity}
              </p>
            ))}
          </div>


          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <p className="font-bold text-lg text-gray-900">
              {t('order.total')}: ₹{order.total_amount}
            </p>
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <select
                value={order.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;

                  try {
                    await fetch(`http://localhost:5000/api/orders/${order.id}/status`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ status: newStatus }),
                    });

                    // update UI without reload (clean way)
                    // window.location.reload();
                  } catch (err) {
                    console.error("Failed to update status:", err);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
      ))}
    </div>
  );
};

export default Dashboard;