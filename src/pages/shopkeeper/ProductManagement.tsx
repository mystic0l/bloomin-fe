import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Product } from '../../types';
import { Plus, Trash2, CreditCard as Edit2, ArrowLeft } from 'lucide-react';

export const ProductManagement = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop, products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    flavor: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });

  if (!currentShop) {
    router.push('/shopkeeper/setup');
    return null;
  }

  const shopProducts = products.filter((p) => p.shopId === currentShop.id);

  const resetForm = () => {
    setFormData({ name: '', flavor: '', price: '', quantity: '', imageUrl: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      flavor: product.flavor,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      imageUrl: product.imageUrl || '',
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        flavor: formData.flavor,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        imageUrl: formData.imageUrl || undefined,
      });
    } else {
      const product: Product = {
        id: Math.random().toString(36).substring(7),
        shopId: currentShop.id,
        name: formData.name,
        flavor: formData.flavor,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        imageUrl: formData.imageUrl || undefined,
        isActive: true,
      };
      addProduct(product);
    }

    resetForm();
  };

  const handleDelete = (productId: string) => {
    if (confirm(t('common.language') === 'hindi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) {
      deleteProduct(productId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/shopkeeper/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('product.manage')}</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('product.add')}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? t('common.edit') : t('product.add')}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Product Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.flavor')} *
                </label>
                <input
                  type="text"
                  value={formData.flavor}
                  onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Red, Blue, Large, Small, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.price')} (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="10.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.quantity')} *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product.image')} URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('product.name')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('product.flavor')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('product.price')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('product.quantity')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t('common.language') === 'hindi' ? 'क्रियाएं' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {shopProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{product.flavor}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">₹{product.price}</td>
                  <td className="py-3 px-4 text-gray-700">{product.quantity}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {shopProducts.length === 0 && !showForm && (
            <p className="text-gray-500 text-center py-8">
              {t('common.language') === 'hindi'
                ? 'अभी तक कोई उत्पाद नहीं जोड़ा गया। ऊपर "+ उत्पाद जोड़ें" बटन पर क्लिक करें।'
                : 'No products added yet. Click the "+ Add Product" button above.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
