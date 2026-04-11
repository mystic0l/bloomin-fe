import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Store, MapPin, Truck, ShoppingBag } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('customer.browseShops')}</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('customer.categories')}</p>
          <div className="flex flex-wrap gap-2">
            {shopTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all'
                  ? t('common.language') === 'hindi'
                    ? 'सभी'
                    : 'All'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => router.push(`/shop/${shop.id}`)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden transform hover:scale-105"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{shop.name}</h3>
                    <span className="text-sm text-gray-600">
                      {shop.type.charAt(0).toUpperCase() + shop.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">{shop.address}</p>
              </div>

              <div className="flex items-center gap-2">
                {shop.serviceType === 'delivery' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Truck className="w-4 h-4" />
                    {t('shop.delivery')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <ShoppingBag className="w-4 h-4" />
                    {t('shop.takeout')}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 px-6 py-3">
              <button className="text-blue-600 font-semibold hover:text-blue-700">
                {t('customer.viewProducts')} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {t('common.language') === 'hindi'
              ? 'कोई दुकान नहीं मिली'
              : 'No shops found'}
          </p>
        </div>
      )}
    </div>
  );
};
export default ShopList;