import { useRouter } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';
import { Store, ShoppingBag, Truck, QrCode, Bell, Smartphone } from 'lucide-react';

export const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {t('common.language') === 'hindi'
            ? 'अपने व्यवसाय को डिजिटल बनाएं'
            : 'Digitalize Your Business'}
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          {t('common.language') === 'hindi'
            ? 'अपनी दुकान को ऑनलाइन लाएं, ऑर्डर प्राप्त करें, और अपने ग्राहकों से जुड़ें'
            : 'Bring your shop online, receive orders, and connect with customers'}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => router.push('/auth?role=shopkeeper')}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg"
          >
            <Store className="w-6 h-6" />
            {t('auth.iAmShopkeeper')}
          </button>

          <button
            onClick={() => router.push('/auth?role=customer')}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg"
          >
            <ShoppingBag className="w-6 h-6" />
            {t('auth.iAmCustomer')}
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Store className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'त्वरित सेटअप' : 'Quick Setup'}
          description={t('common.language') === 'hindi'
            ? '6-7 सवालों में अपनी दुकान तैयार करें'
            : 'Set up your shop in 6-7 simple questions'}
        />

        <FeatureCard
          icon={<QrCode className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'QR कोड' : 'QR Code'}
          description={t('common.language') === 'hindi'
            ? 'ग्राहकों के लिए QR कोड जनरेट करें'
            : 'Generate QR code for customers to scan'}
        />

        <FeatureCard
          icon={<Bell className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'इंस्टेंट नोटिफिकेशन' : 'Instant Notifications'}
          description={t('common.language') === 'hindi'
            ? 'नए ऑर्डर की तुरंत सूचना पाएं'
            : 'Get notified instantly when orders arrive'}
        />

        <FeatureCard
          icon={<Truck className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'ऑर्डर ट्रैकिंग' : 'Order Tracking'}
          description={t('common.language') === 'hindi'
            ? 'ऑर्डर स्टेटस ट्रैक करें और अपडेट करें'
            : 'Track and update order status in real-time'}
        />

        <FeatureCard
          icon={<Smartphone className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'मोबाइल फ्रेंडली' : 'Mobile Friendly'}
          description={t('common.language') === 'hindi'
            ? 'किसी भी डिवाइस से एक्सेस करें'
            : 'Access from any device, anywhere'}
        />

        <FeatureCard
          icon={<ShoppingBag className="w-12 h-12 text-blue-600" />}
          title={t('common.language') === 'hindi' ? 'आसान ऑर्डरिंग' : 'Easy Ordering'}
          description={t('common.language') === 'hindi'
            ? 'ग्राहक आसानी से ऑर्डर कर सकते हैं'
            : 'Customers can place orders with ease'}
        />
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
