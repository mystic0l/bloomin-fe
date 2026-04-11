import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from 'firebase/auth';
import { Shop, Product, Order, Customer, CartItem, UserRole } from '../types';
import { auth } from '../lib/firebase';
import { clearStoredUser } from '../utils/userStorage';

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
  syncUserContext: () => void;

  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Remove only lines for one shop (after checkout). */
  clearCartForShop: (shopId: string) => void;

  addShop: (shop: Shop) => void;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;

  addProduct: (product: Product) => void;
  /** Replace all persisted products for one shop (e.g. after GET /api/products/:shopId). */
  setProductsForShop: (shopId: string, products: Product[]) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;

  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      setUserRole: (role) => {
        set({ userRole: role });
        get().syncUserContext();
      },
      setLanguage: (lang) => set({ language: lang }),
      setCurrentShop: (shop) => set({ currentShop: shop }),
      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

      syncUserContext: () => {
        const state = get();

        if (state.userRole === 'shopkeeper' && state.user) {
          const ownedShop = state.shops.find((shop) => shop.userId === state.user!.id) ?? null;

          if (
            ownedShop &&
            state.currentShop &&
            state.currentShop.id === ownedShop.id &&
            state.currentShop.userId === state.user.id
          ) {
            // already synced
          } else {
            set({ currentShop: ownedShop });
          }
        } else if (state.currentShop) {
          set({ currentShop: null });
        }

        if (state.userRole === 'customer' && state.user) {
          if (state.currentCustomer?.userId !== state.user.id) {
            set({ currentCustomer: null });
          }
        } else if (state.currentCustomer) {
          set({ currentCustomer: null });
        }
      },

      addToCart: (product, quantity) => set((state) => {
        const pid = String(product.id);
        const existing = state.cart.find((item) => String(item.product.id) === pid);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              String(item.product.id) === pid
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        }
        return { cart: [...state.cart, { product, quantity }] };
      }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => String(item.product.id) !== String(productId)),
        })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            String(item.product.id) === String(productId) ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      clearCartForShop: (shopId) =>
        set((state) => ({
          cart: state.cart.filter((item) => {
            const p = item.product as Product & { shop_id?: string | number };
            const sid = p.shopId ?? p.shop_id;
            return String(sid ?? '') !== String(shopId);
          }),
        })),

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

      setProductsForShop: (shopId, newProducts) =>
        set((state) => ({
          products: [
            ...state.products.filter((p) => String(p.shopId) !== String(shopId)),
            ...newProducts,
          ],
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

      logout: () => {
        const currentUid = get().user?.id ?? auth.currentUser?.uid ?? null;
        clearStoredUser(currentUid);
        signOut(auth).catch((error) => {
          console.warn('Failed to sign out from Firebase', error);
        });

        set({
          user: null,
          userRole: null,
          currentShop: null,
          currentCustomer: null,
          cart: []
        });
      }
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
