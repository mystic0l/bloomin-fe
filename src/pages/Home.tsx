import { useRouter } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';
import { Store, ShoppingBag, Truck, QrCode, Bell, Smartphone } from 'lucide-react';

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const isHindi = t('common.language') === 'hindi';

  return (
    <div className="space-y-12 sm:space-y-20 pb-8">
      {/* ── Hero ── */}
      <section className="relative pt-8 sm:pt-16 pb-10 sm:pb-20 text-center overflow-hidden">
        {/* Background decoration */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--saffron) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          {/* Pill label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 fade-up"
            style={{ background: 'var(--saffron-pale)', color: 'var(--saffron)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--saffron)' }} />
            {isHindi ? 'आपकी दुकान, डिजिटल तरीके से' : 'Your Shop, Digital Way'}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-5 leading-tight fade-up"
            style={{ fontFamily: 'Syne, sans-serif', animationDelay: '0.05s' }}
          >
            {isHindi ? (
              <>अपने व्यवसाय को <span className="gradient-text">डिजिटल</span> बनाएं</>
            ) : (
              <>Digitise Your <span className="gradient-text">Business</span></>
            )}
          </h1>

          <p
            className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            {isHindi
              ? 'अपनी दुकान को ऑनलाइन लाएं, ऑर्डर प्राप्त करें, और अपने ग्राहकों से जुड़ें'
              : 'Bring your shop online, receive orders, and connect with customers effortlessly'}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            <button
              onClick={() => router.push('/auth?role=shopkeeper')}
              className="btn-primary text-base px-7 py-3.5 rounded-2xl w-full sm:w-auto"
            >
              <Store className="w-5 h-5" />
              {t('auth.iAmShopkeeper')}
            </button>
            <button
              onClick={() => router.push('/auth?role=customer')}
              className="btn-green text-base px-7 py-3.5 rounded-2xl w-full sm:w-auto"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('auth.iAmCustomer')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-1">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            className="text-2xl sm:text-3xl font-bold text-slate-800"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {isHindi ? 'सब कुछ एक जगह' : 'Everything in One Place'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {isHindi ? 'दुकान चलाना अब और भी आसान' : 'Running your shop has never been easier'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            icon={<Store className="w-6 h-6" style={{ color: 'var(--saffron)' }} />}
            iconBg="var(--saffron-pale)"
            title={isHindi ? 'त्वरित सेटअप' : 'Quick Setup'}
            description={isHindi
              ? '6-7 सवालों में अपनी दुकान तैयार करें'
              : 'Set up your shop in 6-7 simple questions'}
          />
          <FeatureCard
            icon={<QrCode className="w-6 h-6" style={{ color: 'var(--emerald)' }} />}
            iconBg="var(--emerald-pale)"
            title={isHindi ? 'QR कोड' : 'QR Code'}
            description={isHindi
              ? 'ग्राहकों के लिए QR कोड जनरेट करें'
              : 'Generate QR code for customers to scan'}
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6" style={{ color: '#7C3AED' }} />}
            iconBg="#F5F3FF"
            title={isHindi ? 'इंस्टेंट नोटिफिकेशन' : 'Instant Notifications'}
            description={isHindi
              ? 'नए ऑर्डर की तुरंत सूचना पाएं'
              : 'Get notified instantly when orders arrive'}
          />
          <FeatureCard
            icon={<Truck className="w-6 h-6" style={{ color: '#0284C7' }} />}
            iconBg="#F0F9FF"
            title={isHindi ? 'ऑर्डर ट्रैकिंग' : 'Order Tracking'}
            description={isHindi
              ? 'ऑर्डर स्टेटस ट्रैक करें और अपडेट करें'
              : 'Track and update order status in real-time'}
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" style={{ color: '#D97706' }} />}
            iconBg="#FFFBEB"
            title={isHindi ? 'मोबाइल फ्रेंडली' : 'Mobile Friendly'}
            description={isHindi
              ? 'किसी भी डिवाइस से एक्सेस करें'
              : 'Access from any device, anywhere'}
          />
          <FeatureCard
            icon={<ShoppingBag className="w-6 h-6" style={{ color: '#DB2777' }} />}
            iconBg="#FDF2F8"
            title={isHindi ? 'आसान ऑर्डरिंग' : 'Easy Ordering'}
            description={isHindi
              ? 'ग्राहक आसानी से ऑर्डर कर सकते हैं'
              : 'Customers can place orders with ease'}
          />
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, iconBg, title, description }: FeatureCardProps) => (
  <div className="card p-5 sm:p-6 flex gap-4 items-start">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <div>
      <h3
        className="text-base font-bold text-slate-800 mb-1"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default Home;