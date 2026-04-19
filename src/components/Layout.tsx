'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { Store, User, LogOut, ShoppingBag, Globe, Menu, X, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { user, userRole, language, setLanguage, logout } = useStore();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Dark mode state ──────────────────────────────────────────────────────────
  // Always initialise to false so server + client render identically (avoids hydration mismatch).
  // After mount, read localStorage once and apply the stored preference.
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('theme') === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);
  // ─────────────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'hindi' : 'english');
  };

  const navTo = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 border-b border-slate-100"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <button
              onClick={() => navTo('/')}
              className="flex items-center gap-2 group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--saffron)' }}
              >
                <Store className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-lg font-bold hidden sm:block"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--slate-deep)' }}
              >
                Bloom<span style={{ color: 'var(--saffron)' }}>In</span>
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language toggle */}
              <button onClick={toggleLanguage} className="nav-link">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  {language === 'english' ? 'EN' : 'हिं'}
                </span>
              </button>

              {/* ── Dark mode toggle (desktop) ── */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="nav-link"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark
                  ? <Sun className="w-4 h-4" style={{ color: '#FBBF24' }} />
                  : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <>
                  {userRole === 'shopkeeper' && (
                    <button
                      onClick={() => navTo('/shopkeeper/dashboard')}
                      className="nav-link"
                    >
                      <Store className="w-4 h-4" />
                      <span>{t('shop.dashboard')}</span>
                    </button>
                  )}
                  {userRole === 'customer' && (
                    <>
                      <button
                        onClick={() => navTo('/customer/shops')}
                        className="nav-link"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('customer.browseShops')}</span>
                      </button>
                      <button
                        onClick={() => navTo('/customer/orders')}
                        className="nav-link"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('order.myOrders')}</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ color: '#EF4444' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile: language + dark toggle + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ color: 'var(--slate-mid)', background: '#F8FAFC' }}
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'english' ? 'EN' : 'हिं'}
              </button>

              {/* ── Dark mode toggle (mobile) ── */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--slate-mid)', background: '#F8FAFC' }}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark
                  ? <Sun className="w-4 h-4" style={{ color: '#FBBF24' }} />
                  : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--slate-mid)', background: '#F8FAFC' }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && user && (
          <div
            className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 fade-up"
            style={{ background: 'white' }}
          >
            {userRole === 'shopkeeper' && (
              <button
                onClick={() => navTo('/shopkeeper/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--slate-deep)' }}
              >
                <Store className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                {t('shop.dashboard')}
              </button>
            )}
            {userRole === 'customer' && (
              <>
                <button
                  onClick={() => navTo('/customer/shops')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--slate-deep)' }}
                >
                  <ShoppingBag className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  {t('customer.browseShops')}
                </button>
                <button
                  onClick={() => navTo('/customer/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--slate-deep)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  {t('order.myOrders')}
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </button>
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
};