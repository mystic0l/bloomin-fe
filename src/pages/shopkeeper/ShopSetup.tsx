import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Store } from 'lucide-react';

const SHOP_TYPES = [
  'grocery', 'pharmacy', 'restaurant', 'electronics',
  'clothing', 'hardware', 'bakery', 'stationery',
];

const ShopSetup = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, addShop } = useStore();
  const isHindi = t('common.language') === 'hindi';

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    language: 'english' as 'english' | 'hindi',
    serviceType: 'takeout' as 'takeout' | 'delivery',
    upiId: '',
    upiQrUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('http://localhost:5000/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        type: formData.type,
        address: formData.address,
        owner_id: user.id || 'demo-user',
      }),
    });

    const createdShop = await res.json();
    if (!res.ok) { console.error('Shop create failed:', createdShop); return; }

    addShop({
      id: String(createdShop.id),
      userId: user.id,
      name: createdShop.name ?? formData.name,
      type: createdShop.type ?? formData.type,
      address: createdShop.address ?? formData.address,
      language: formData.language,
      serviceType: formData.serviceType,
      upiId: formData.upiId || undefined,
      upiQrUrl: formData.upiQrUrl || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    router.push('/shopkeeper/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page title */}
      <div className="flex items-center gap-3 mb-5 sm:mb-7">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--saffron-pale)' }}
        >
          <Store className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
        </div>
        <div>
          <h1 className="section-title text-xl sm:text-2xl">{t('shop.setup')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHindi ? 'अपनी दुकान की जानकारी भरें' : 'Fill in your shop information'}
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              {t('shop.shopName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-base"
              placeholder="My Shop"
            />
          </div>

          {/* Shop type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              {t('shop.shopType')} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="input-base"
            >
              <option value="">{isHindi ? 'चुनें' : 'Select type'}</option>
              {SHOP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              {t('common.address')} *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="input-base resize-none"
              placeholder={isHindi ? 'पूरा पता' : 'Full address'}
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              {t('shop.language')} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['english', 'hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: lang })}
                  className="py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                  style={
                    formData.language === lang
                      ? { background: 'var(--saffron)', color: 'white', boxShadow: '0 2px 8px rgba(255,107,53,0.3)' }
                      : { background: '#F1F5F9', color: 'var(--slate-mid)' }
                  }
                >
                  {lang === 'english' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Service type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              {t('shop.serviceType')} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['takeout', 'delivery'] as const).map((sType) => (
                <button
                  key={sType}
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceType: sType })}
                  className="py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                  style={
                    formData.serviceType === sType
                      ? { background: 'var(--saffron)', color: 'white', boxShadow: '0 2px 8px rgba(255,107,53,0.3)' }
                      : { background: '#F1F5F9', color: 'var(--slate-mid)' }
                  }
                >
                  {sType === 'takeout' ? t('shop.takeout') : t('shop.delivery')}
                </button>
              ))}
            </div>
          </div>

          {/* UPI (delivery only) */}
          {formData.serviceType === 'delivery' && (
            <div className="space-y-4 p-4 rounded-2xl" style={{ background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {isHindi ? 'भुगतान (वैकल्पिक)' : 'Payment (Optional)'}
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {t('shop.upiId')}
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="input-base"
                  placeholder="yourname@upi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {t('shop.upiQr')}
                </label>
                <input
                  type="url"
                  value={formData.upiQrUrl}
                  onChange={(e) => setFormData({ ...formData, upiQrUrl: e.target.value })}
                  className="input-base"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3.5 text-base rounded-2xl mt-2">
            {t('common.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopSetup;