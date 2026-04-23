"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Product } from '../../types';
import { mapDbProductRow } from '../../utils/mapDbProduct';
import { Plus, Trash2, CreditCard as Edit2, ArrowLeft, Package } from 'lucide-react';

const ProductManagement = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentShop, products, addProduct, setProductsForShop, updateProduct, deleteProduct } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const isHindi = t('common.language') === 'hindi';

  const [formData, setFormData] = useState({
    name: '',
    flavor: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!currentShop) router.push('/shopkeeper/setup');
  }, [currentShop, router]);

  useEffect(() => {
    if (!currentShop?.id) return;
    let cancelled = false;
    const shopId = String(currentShop.id);
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${shopId}`);
        const data = await res.json();
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setProductsForShop(shopId, rows.map((row) => mapDbProductRow(row as Record<string, unknown>)));
      } catch (err) {
        console.error('[ProductManagement] load products:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentShop?.id, setProductsForShop]);

  const shopProducts = currentShop
    ? products.filter((p) => String(p.shopId) === String(currentShop.id))
    : [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        flavor: formData.flavor,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        imageUrl: formData.imageUrl || undefined,
      });
      resetForm();
      return;
    }
    if (!currentShop) return;
    const shopIdNum = Number(currentShop.id);
    const payload = {
  name: formData.name,
  price: parseFloat(formData.price),
  quantity: parseInt(formData.quantity, 10),
  shop_id: shopIdNum,
  flavor: formData.flavor,
  image_url: formData.imageUrl || null,
};
    console.log('[ProductManagement] POST /api/products', payload);
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { console.error('[ProductManagement] create failed:', data); return; }
      console.log('[ProductManagement] created product row:', data);
      addProduct(mapDbProductRow(data as Record<string, unknown>));
      resetForm();
    } catch (err) {
      console.error('[ProductManagement] FETCH ERROR:', err);
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm(isHindi ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) {
      deleteProduct(productId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/shopkeeper/dashboard')}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
          style={{ color: 'var(--slate-mid)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </button>
      </div>

      <div className="card p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title text-xl sm:text-2xl">{t('product.manage')}</h1>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('product.add')}</span>
            <span className="sm:hidden">{isHindi ? 'जोड़ें' : 'Add'}</span>
          </button>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div
            className="mb-6 p-5 rounded-2xl border border-slate-100 fade-up"
            style={{ background: '#FAFAFA' }}
          >
            <h3 className="font-bold text-slate-800 text-base mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              {editingProduct ? t('common.edit') : t('product.add')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('product.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-base"
                    placeholder="Product Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('product.flavor')} *
                  </label>
                  <input
                    type="text"
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    required
                    className="input-base"
                    placeholder="Red, Blue, Large, Small…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('product.price')} (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="input-base"
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('product.quantity')} *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="input-base"
                    placeholder="50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('product.image')} URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-base"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-sm flex-1 sm:flex-none">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-1 sm:flex-none"
                  style={{ background: '#F1F5F9', color: 'var(--slate-mid)' }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product table (desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table-base w-full">
            <thead>
              <tr>
                <th>{t('product.name')}</th>
                <th>{t('product.flavor')}</th>
                <th>{t('product.price')}</th>
                <th>{t('product.quantity')}</th>
                <th>{isHindi ? 'क्रियाएं' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {shopProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <span className="font-semibold text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-500">{product.flavor}</td>
                  <td className="font-bold text-slate-800">₹{product.price}</td>
                  <td>
                    <span
                      className="badge"
                      style={
                        product.quantity > 0
                          ? { background: 'var(--emerald-pale)', color: 'var(--emerald)' }
                          : { background: '#FEF2F2', color: '#DC2626' }
                      }
                    >
                      {product.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#1D4ED8', background: '#EFF6FF' }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#DC2626', background: '#FEF2F2' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product cards (mobile) */}
        <div className="md:hidden space-y-3">
          {shopProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100"
              style={{ background: '#FAFAFA' }}
            >
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{product.flavor}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-bold text-sm" style={{ color: 'var(--saffron)' }}>₹{product.price}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span
                    className="badge text-xs"
                    style={
                      product.quantity > 0
                        ? { background: 'var(--emerald-pale)', color: 'var(--emerald)' }
                        : { background: '#FEF2F2', color: '#DC2626' }
                    }
                  >
                    {product.quantity} {isHindi ? 'उपलब्ध' : 'in stock'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 rounded-lg"
                  style={{ color: '#1D4ED8', background: '#EFF6FF' }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg"
                  style={{ color: '#DC2626', background: '#FEF2F2' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {shopProducts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F8FAFC' }}
            >
              <Package className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {isHindi
                ? 'अभी तक कोई उत्पाद नहीं जोड़ा गया'
                : 'No products added yet. Click "+ Add" above.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;