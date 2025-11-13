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
      ? fallback === "setup"
        ? "/shopkeeper/setup"
        : "/shopkeeper/dashboard"
      : fallback === "shops"
      ? "/customer/shops"
      : "/customer/shops";

    if (!redirectRef.current) {
      redirectRef.current = true;
      router.replace(destination);
    }
  };

  // Restore role from storage if it exists
  useEffect(() => {
    const savedUser = loadStoredUser(auth.currentUser?.uid);
    if (savedUser?.role) {
      setRole(savedUser.role);
    } else {
      const roleParam = searchParams?.get("role");
      if (roleParam === "shopkeeper" || roleParam === "customer") {
        setRole(roleParam);
      }
    }
  }, [searchParams]);

  // Listen for Firebase login state changes
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
    if (!checkingAuth && userRoleState === "shopkeeper" && userId) {
      syncUserContext();
    }
  }, [checkingAuth, userRoleState, userId, shops, syncUserContext]);

  // Signup / Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let userCredential;

      if (isLogin) {
        // Login existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      const existingProfile = loadStoredUser(user.uid);

      const resolvedRole =
        (isLogin ? existingProfile?.role : null) ||
        (role === "shopkeeper" || role === "customer" ? role : "customer");

      const resolvedName = isLogin ? existingProfile?.name : name;
      const resolvedPhone = isLogin ? existingProfile?.phone : phone;

      const userData: StoredUser = {
        uid: user.uid,
        email: user.email,
        role: resolvedRole,
        name: resolvedName,
        phone: resolvedPhone,
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          {role === "shopkeeper" ? (
            <Store className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          ) : (
            <ShoppingBag className="w-16 h-16 text-green-600 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>
          <p className="text-gray-600 mt-2">
            {role === "shopkeeper" ? t("auth.shopkeeperLogin") : t("auth.customerLogin")}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setRole("shopkeeper")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              role === "shopkeeper"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Store className="w-5 h-5 inline mr-2" />
            {t("common.shopkeeper")}
          </button>
          <button
            onClick={() => setRole("customer")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              role === "customer"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ShoppingBag className="w-5 h-5 inline mr-2" />
            {t("common.customer")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
              role === "shopkeeper"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLogin ? t("common.login") : t("common.signup")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don’t have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
