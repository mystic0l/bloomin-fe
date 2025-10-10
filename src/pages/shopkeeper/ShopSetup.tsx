import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Shop } from '../../types';

const SHOP_TYPES = [
  'grocery',
  'pharmacy',
  'restaurant',
  'electronics',
  'clothing',
  'hardware',
  'bakery',
  'stationery',
];

 const ShopSetup = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, addShop } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    language: 'english' as 'english' | 'hindi',
    serviceType: 'takeout' as 'takeout' | 'delivery',
    upiId: '',
    upiQrUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const shop: Shop = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      name: formData.name,
      type: formData.type,
      address: formData.address,
      language: formData.language,
      serviceType: formData.serviceType,
      upiId: formData.upiId || undefined,
      upiQrUrl: formData.upiQrUrl || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addShop(shop);
    router.push('/shopkeeper/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('shop.setup')}</h1>
        <p className="text-gray-600 mb-8">
          {t('common.language') === 'hindi'
            ? 'अपनी दुकान की जानकारी भरें (6-7 प्रश्न)'
            : 'Fill in your shop information (6-7 questions)'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shop.shopName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Shop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shop.shopType')} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.language') === 'hindi' ? 'चुनें' : 'Select'}</option>
              {SHOP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.address')} *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('common.language') === 'hindi' ? 'पूरा पता' : 'Full address'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shop.language')} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, language: 'english' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.language === 'english'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, language: 'hindi' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.language === 'hindi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shop.serviceType')} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, serviceType: 'takeout' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.serviceType === 'takeout'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('shop.takeout')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, serviceType: 'delivery' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.serviceType === 'delivery'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('shop.delivery')}
              </button>
            </div>
          </div>

          {formData.serviceType === 'delivery' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.upiId')}
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="yourname@upi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shop.upiQr')}
                </label>
                <input
                  type="url"
                  value={formData.upiQrUrl}
                  onChange={(e) => setFormData({ ...formData, upiQrUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('common.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopSetup;