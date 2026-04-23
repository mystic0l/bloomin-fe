import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Store, MapPin, Truck, ShoppingBag, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const ShopList = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [shops, setShops] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shops");
        const data = await res.json();
        setShops(data);
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };
    fetchShops();
  }, []);

  const isHindi = t('common.language') === 'hindi';
  const activeShops = shops;
  const shopTypes = ['all', ...Array.from(new Set(activeShops.map((shop) => shop.type)))];

  const filteredShops = activeShops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || shop.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Header + Search */}
      <div className="card p-5 sm:p-8">
        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-800 mb-5"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {t('customer.browseShops')}
        </h1>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="input-base pl-10"
          />
        </div>

        {/* Category chips */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t('customer.categories')}
          </p>
          <div className="flex flex-wrap gap-2">
            {shopTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={
                  selectedType === type
                    ? { background: 'var(--saffron)', color: 'white', boxShadow: '0 2px 8px rgba(255,107,53,0.3)' }
                    : { background: '#F1F5F9', color: 'var(--slate-mid)' }
                }
              >
                {type === 'all'
                  ? (isHindi ? 'सभी' : 'All')
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredShops.length > 0 && (
        <p className="text-sm text-slate-500 px-1">
          {filteredShops.length} {isHindi ? 'दुकानें मिलीं' : 'shops found'}
        </p>
      )}

      {/* Shop grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredShops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            onClick={() => router.push(`/shop/${shop.id}`)}
            t={t}
          />
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="card p-12 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--saffron-pale)' }}
          >
            <Store className="w-7 h-7" style={{ color: 'var(--saffron)' }} />
          </div>
          <p className="text-slate-600 font-medium">
            {isHindi ? 'कोई दुकान नहीं मिली' : 'No shops found'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {isHindi ? 'अलग खोज करें' : 'Try a different search'}
          </p>
        </div>
      )}
    </div>
  );
};

const ShopCard = ({ shop, onClick, t }: any) => {
  const isDelivery = shop.serviceType === 'delivery' || shop.service_type === 'delivery';

  return (
    <button
      onClick={onClick}
      className="card text-left overflow-hidden group w-full transition-all duration-200 hover:-translate-y-0.5 active:scale-99"
    >
      {/* Top accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: isDelivery ? 'var(--emerald)' : 'var(--saffron)' }}
      />

      <div className="p-5">
        {/* Shop icon + name */}
        <div className="flex items-start gap-3 mb-3">
          {shop.image_url ? (
  <img
    src={`http://localhost:5000${shop.image_url}`}
    alt={shop.name}
    className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
  />
) : (
  <div
    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
    style={{ background: 'var(--saffron-pale)' }}
  >
    <Store className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
  </div>
)}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-slate-800 text-base leading-tight truncate"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {shop.name}
            </h3>
            <span className="text-xs text-slate-500 capitalize">
              {shop.type}
            </span>
          </div>
          <ChevronRight
            className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1"
          />
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{shop.address}</p>
        </div>

        {/* Service type badge */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={
              isDelivery
                ? { background: 'var(--emerald-pale)', color: 'var(--emerald)' }
                : { background: 'var(--saffron-pale)', color: 'var(--saffron)' }
            }
          >
            {isDelivery
              ? <><Truck className="w-3 h-3" />{t('shop.delivery')}</>
              : <><ShoppingBag className="w-3 h-3" />{t('shop.takeout')}</>
            }
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--saffron)' }}
          >
            {t('customer.viewProducts')} →
          </span>
        </div>
      </div>
    </button>
  );
};

export default ShopList;