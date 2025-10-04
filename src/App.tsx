import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { ShopSetup } from './pages/shopkeeper/ShopSetup';
import { Dashboard } from './pages/shopkeeper/Dashboard';
import { ProductManagement } from './pages/shopkeeper/ProductManagement';
import { ShopList } from './pages/customer/ShopList';
import { ShopView } from './pages/customer/ShopView';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { Orders } from './pages/customer/Orders';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          <Route path="/shopkeeper/setup" element={<ProtectedRoute role="shopkeeper"><ShopSetup /></ProtectedRoute>} />
          <Route path="/shopkeeper/dashboard" element={<ProtectedRoute role="shopkeeper"><Dashboard /></ProtectedRoute>} />
          <Route path="/shopkeeper/products" element={<ProtectedRoute role="shopkeeper"><ProductManagement /></ProtectedRoute>} />

          <Route path="/customer/shops" element={<ShopList />} />
          <Route path="/shop/:shopId" element={<ShopView />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/checkout/:shopId" element={<ProtectedRoute role="customer"><Checkout /></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'shopkeeper' | 'customer' }) {
  const { user, userRole } = useStore();

  if (!user) {
    return <Navigate to={`/auth?role=${role}`} replace />;
  }

  if (userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default App;
