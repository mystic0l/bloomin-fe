"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { Store, Upload, X, ArrowLeft } from "lucide-react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SHOP_TYPES = [
  "grocery",
  "pharmacy",
  "restaurant",
  "electronics",
  "clothing",
  "hardware",
  "bakery",
  "stationery",
];

const SHOP_TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  grocery: { en: "Grocery", hi: "किराना" },
  pharmacy: { en: "Pharmacy", hi: "दवा की दुकान" },
  restaurant: { en: "Restaurant", hi: "रेस्तरां" },
  electronics: { en: "Electronics", hi: "इलेक्ट्रॉनिक्स" },
  clothing: { en: "Clothing", hi: "कपड़े" },
  hardware: { en: "Hardware", hi: "हार्डवेयर" },
  bakery: { en: "Bakery", hi: "बेकरी" },
  stationery: { en: "Stationery", hi: "स्टेशनरी" },
};

const SettingsPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const isHindi = t("common.language") === "hindi";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load current shop
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const idToken = await getIdToken(user);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shops`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to fetch shops:", data);
          return;
        }

        const userShop = Array.isArray(data)
          ? data.find((s: any) => s.owner_id === user.uid)
          : null;

        if (!userShop) {
          router.push("/shopkeeper/setup");
          return;
        }

        setShop(userShop);

        setFormData({
          name: userShop.name ?? "",
          type: userShop.type ?? "",
          address: userShop.address ?? "",
        });

        if (userShop.image_url) {
          setImagePreview(userShop.image_url);
        }
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shop) return;

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated Firebase user");
        return;
      }

      const idToken = await getIdToken(user);

      const body = new FormData();

      body.append("name", formData.name);
      body.append("type", formData.type);
      body.append("address", formData.address);

      if (imageFile) {
        body.append("image", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shops/${shop.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Shop update failed:", data);
        return;
      }

      console.log("Shop updated:", data);

      router.push("/shopkeeper/dashboard");
    } catch (err) {
      console.error("UPDATE SHOP ERROR:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading shop...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-3 mb-5 sm:mb-7">
        <button
          type="button"
          onClick={() => router.push("/shopkeeper/dashboard")}
          className="p-2 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--saffron-pale)" }}
        >
          <Store className="w-5 h-5" style={{ color: "var(--saffron)" }} />
        </div>

        <div>
          <h1 className="section-title text-xl sm:text-2xl">Edit Shop</h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Update your shop information
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Shop Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="shop-image-upload"
            />

            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Shop preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md"
                  style={{ color: "#EF4444" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="shop-image-upload"
                className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer"
                style={{ background: "var(--saffron-pale)" }}
              >
                <Upload
                  className="w-6 h-6 mb-2"
                  style={{ color: "var(--saffron)" }}
                />

                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--saffron)" }}
                >
                  Upload shop image
                </span>

                <span className="text-xs text-slate-400 mt-0.5">
                  PNG, JPG up to 5MB
                </span>
              </label>
            )}
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Shop Name *
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              required
              className="input-base"
              placeholder="My Shop"
            />
          </div>

          {/* Shop Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Shop Type *
            </label>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
              required
              className="input-base"
            >
              <option value="">Select type</option>

              {SHOP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {isHindi
                    ? SHOP_TYPE_LABELS[type].hi
                    : SHOP_TYPE_LABELS[type].en}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Address *
            </label>

            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              required
              rows={3}
              className="input-base resize-none"
              placeholder="Full address"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3.5 text-base rounded-2xl mt-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
