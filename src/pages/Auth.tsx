"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "../store";
import { useTranslation } from "../hooks/useTranslation";
import { Store, ShoppingBag } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserRole } from "../types";
import {
  StoredUser,
  loadStoredUser,
  persistUserProfile,
  clearStoredUser,
} from "../utils/userStorage";

const Auth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const setUser = useStore((state) => state.setUser);
  const setUserRole = useStore((state) => state.setUserRole);
  const syncUserContext = useStore((state) => state.syncUserContext);
  const userRoleState = useStore((state) => state.userRole);
  const userId = useStore((state) => state.user?.id);
  const shops = useStore((state) => state.shops);

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"shopkeeper" | "customer">(
    (searchParams?.get("role") as "shopkeeper" | "customer") || "customer"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const redirectRef = useRef(false);

  const redirectToRoleHome = (userRole: Exclude<UserRole, null>, fallback?: "setup" | "shops") => {
    const isShopkeeper = userRole === "shopkeeper";
    const destination = isShopkeeper
      ? fallback === "setup" ? "/shopkeeper/setup" : "/shopkeeper/dashboard"
      : "/customer/shops";
    if (!redirectRef.current) {
      redirectRef.current = true;
      router.replace(destination);
    }
  };

  useEffect(() => {
    const savedUser = loadStoredUser(auth.currentUser?.uid);
    if (savedUser?.role) {
      setRole(savedUser.role);
    } else {
      const roleParam = searchParams?.get("role");
      if (roleParam === "shopkeeper" || roleParam === "customer") setRole(roleParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        redirectRef.current = false;
        setUser(null);
        setUserRole(null);
        clearStoredUser(auth.currentUser?.uid);
        setCheckingAuth(false);
        return;
      }
      const savedProfile = loadStoredUser(firebaseUser.uid);
      if (savedProfile?.role) {
        const mergedProfile: StoredUser = {
          ...savedProfile,
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? savedProfile.email ?? null,
        };
        persistUserProfile(mergedProfile);
        setRole(mergedProfile.role);
        setUser({ id: firebaseUser.uid, email: mergedProfile.email ?? "" });
        setUserRole(mergedProfile.role);
        redirectToRoleHome(mergedProfile.role);
      } else {
        redirectRef.current = false;
        setUser({ id: firebaseUser.uid, email: firebaseUser.email ?? "" });
        setUserRole(null);
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [router, setUser, setUserRole]);

  useEffect(() => {
    if (!checkingAuth && userRoleState === "shopkeeper" && userId) syncUserContext();
  }, [checkingAuth, userRoleState, userId, shops, syncUserContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      const user = userCredential.user;
      const existingProfile = loadStoredUser(user.uid);
      const resolvedRole =
        (isLogin ? existingProfile?.role : null) ||
        (role === "shopkeeper" || role === "customer" ? role : "customer");
      const userData: StoredUser = {
        uid: user.uid,
        email: user.email,
        role: resolvedRole,
        name: isLogin ? existingProfile?.name : name,
        phone: isLogin ? existingProfile?.phone : phone,
      };
      persistUserProfile(userData);
      setUser({ id: userData.uid, email: userData.email ?? "" });
      setUserRole(userData.role);
      setRole(userData.role);
      redirectRef.current = false;
      if (isLogin) {
        redirectToRoleHome(userData.role);
      } else {
        redirectToRoleHome(userData.role, userData.role === "shopkeeper" ? "setup" : "shops");
      }
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      alert(error.message);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-3 pulse-soft"
            style={{ background: 'var(--saffron-pale)' }}
          />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  const isShopkeeper = role === "shopkeeper";

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / context */}
        <div className="text-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: isShopkeeper ? 'var(--saffron-pale)' : 'var(--emerald-pale)' }}
          >
            {isShopkeeper
              ? <Store className="w-7 h-7" style={{ color: 'var(--saffron)' }} />
              : <ShoppingBag className="w-7 h-7" style={{ color: 'var(--emerald)' }} />
            }
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-slate-800"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isShopkeeper ? t("auth.shopkeeperLogin") : t("auth.customerLogin")}
          </p>
        </div>

        <div className="card p-5 sm:p-7">
          {/* Role switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setRole("shopkeeper")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={
                role === "shopkeeper"
                  ? { background: 'var(--saffron)', color: 'white', boxShadow: '0 2px 8px rgba(255,107,53,0.3)' }
                  : { background: '#F1F5F9', color: 'var(--slate-mid)' }
              }
            >
              <Store className="w-4 h-4" />
              {t("common.shopkeeper")}
            </button>
            <button
              onClick={() => setRole("customer")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={
                role === "customer"
                  ? { background: 'var(--emerald)', color: 'white', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }
                  : { background: '#F1F5F9', color: 'var(--slate-mid)' }
              }
            >
              <ShoppingBag className="w-4 h-4" />
              {t("common.customer")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('common.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-base"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {t('common.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="input-base"
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                {t('common.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                {t('common.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-98 mt-1"
              style={
                isShopkeeper
                  ? { background: 'var(--saffron)', boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }
                  : { background: 'var(--emerald)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }
              }
            >
              {isLogin ? t("common.login") : t("common.signup")}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--saffron)' }}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;