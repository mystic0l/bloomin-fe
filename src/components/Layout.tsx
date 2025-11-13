import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Store, User, LogOut, ShoppingBag, Globe } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { user, userRole, language, setLanguage, logout } = useStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'hindi' : 'english');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                BloomIn
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {language === 'english' ? 'EN' : 'हिं'}
                </span>
              </button>

              {user && (
                <>
                  {userRole === 'shopkeeper' && (
                    <button
                      onClick={() => router.push('/shopkeeper/dashboard')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Store className="w-5 h-5" />
                      <span className="font-medium">{t('shop.dashboard')}</span>
                    </button>
                  )}

                  {userRole === 'customer' && (
                    <>
                      <button
                        onClick={() => router.push('/customer/shops')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-medium">{t('customer.browseShops')}</span>
                      </button>
                      <button
                        onClick={() => router.push('/customer/orders')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">{t('order.myOrders')}</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('common.logout')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
