import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, Package } from 'lucide-react';

export const Orders = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { orders, currentCustomer, user, shops } = useStore();

  const customerOrders = orders.filter(
    (order) => order.customerId === (currentCustomer?.id || user?.id)
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('order.myOrders')}</h1>

        {customerOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">
              {t('common.language') === 'hindi'
                ? 'अभी तक कोई ऑर्डर नहीं'
                : 'No orders yet'}
            </p>
            <button
              onClick={() => router.push('/customer/shops')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('customer.browseShops')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {customerOrders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((order) => {
                const shop = shops.find((s) => s.id === order.shopId);
                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{shop?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
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
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {t('common.language') === 'hindi' ? 'आइटम:' : 'Items:'}
                      </p>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>
                              {item.productName} ({item.productFlavor}) x {item.quantity}
                            </span>
                            <span>₹{item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">{t('customer.paymentMethod')}</p>
                        <p className="font-medium text-gray-900">
                          {order.paymentMethod === 'cash_on_delivery'
                            ? t('customer.cashOnDelivery')
                            : t('customer.upiOnDelivery')}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {t('order.total')}: ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {t('common.address')}: {order.customerAddress}
                      </p>
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {t('common.language') === 'hindi'
                            ? 'आपका ऑर्डर दुकानदार द्वारा समीक्षाधीन है'
                            : 'Your order is being reviewed by the shopkeeper'}
                        </p>
                      </div>
                    )}

                    {order.status === 'accepted' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {t('common.language') === 'hindi'
                            ? 'आपका ऑर्डर स्वीकार कर लिया गया है और तैयार किया जा रहा है'
                            : 'Your order has been accepted and is being prepared'}
                        </p>
                      </div>
                    )}

                    {order.status === 'ready' && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800">
                          {shop?.serviceType === 'delivery'
                            ? t('common.language') === 'hindi'
                              ? 'आपका ऑर्डर डिलीवरी के लिए तैयार है'
                              : 'Your order is ready for delivery'
                            : t('common.language') === 'hindi'
                            ? 'आपका ऑर्डर पिकअप के लिए तैयार है'
                            : 'Your order is ready for pickup'}
                        </p>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          {t('common.language') === 'hindi'
                            ? 'ऑर्डर पूर्ण हो गया है। धन्यवाद!'
                            : 'Order completed. Thank you!'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
