import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Store, ShoppingBag } from 'lucide-react';

export const Auth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { setUser, setUserRole } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'shopkeeper' | 'customer'>(
    (searchParams?.get('role') as 'shopkeeper' | 'customer') || 'customer'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const roleParam = searchParams?.get('role');
    if (roleParam === 'shopkeeper' || roleParam === 'customer') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = Math.random().toString(36).substring(7);
    setUser({ id: userId, email });
    setUserRole(role);

    if (role === 'shopkeeper') {
      router.push('/shopkeeper/setup');
    } else {
      router.push('/customer/shops');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          {role === 'shopkeeper' ? (
            <Store className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          ) : (
            <ShoppingBag className="w-16 h-16 text-green-600 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="text-gray-600 mt-2">
            {role === 'shopkeeper' ? t('auth.shopkeeperLogin') : t('auth.customerLogin')}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setRole('shopkeeper')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              role === 'shopkeeper'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Store className="w-5 h-5 inline mr-2" />
            {t('common.shopkeeper')}
          </button>
          <button
            onClick={() => setRole('customer')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              role === 'customer'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5 inline mr-2" />
            {t('common.customer')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('common.name')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('common.email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('common.password')}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
              role === 'shopkeeper'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLogin ? t('common.login') : t('common.signup')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};
