import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shop, Product, Order, Customer, CartItem, UserRole } from '../types';

interface AppState {
  user: { id: string; email: string } | null;
  userRole: UserRole;
  language: 'english' | 'hindi';
  currentShop: Shop | null;
  currentCustomer: Customer | null;
  cart: CartItem[];
  shops: Shop[];
  products: Product[];
  orders: Order[];

  setUser: (user: { id: string; email: string } | null) => void;
  setUserRole: (role: UserRole) => void;
  setLanguage: (lang: 'english' | 'hindi') => void;
  setCurrentShop: (shop: Shop | null) => void;
  setCurrentCustomer: (customer: Customer | null) => void;

  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  addShop: (shop: Shop) => void;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;

  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;

  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      userRole: null,
      language: 'english',
      currentShop: null,
      currentCustomer: null,
      cart: [],
      shops: [],
      products: [],
      orders: [],

      setUser: (user) => set({ user }),
      setUserRole: (role) => set({ userRole: role }),
      setLanguage: (lang) => set({ language: lang }),
      setCurrentShop: (shop) => set({ currentShop: shop }),
      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

      addToCart: (product, quantity) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== productId)
      })),

      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      })),

      clearCart: () => set({ cart: [] }),

      addShop: (shop) => set((state) => ({
        shops: [...state.shops, shop],
        currentShop: shop
      })),

      updateShop: (shopId, updates) => set((state) => ({
        shops: state.shops.map(shop =>
          shop.id === shopId ? { ...shop, ...updates } : shop
        ),
        currentShop: state.currentShop?.id === shopId
          ? { ...state.currentShop, ...updates }
          : state.currentShop
      })),

      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),

      updateProduct: (productId, updates) => set((state) => ({
        products: state.products.map(product =>
          product.id === productId ? { ...product, ...updates } : product
        )
      })),

      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter(product => product.id !== productId)
      })),

      addOrder: (order) => set((state) => ({
        orders: [...state.orders, order]
      })),

      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        )
      })),

      logout: () => set({
        user: null,
        userRole: null,
        currentShop: null,
        currentCustomer: null,
        cart: []
      })
    }),
    {
      name: 'business-digitalizer-storage',
      partialize: (state) => ({
        user: state.user,
        userRole: state.userRole,
        language: state.language,
        currentShop: state.currentShop,
        currentCustomer: state.currentCustomer,
        cart: state.cart,
        shops: state.shops,
        products: state.products,
        orders: state.orders
      })
    }
  )
);
