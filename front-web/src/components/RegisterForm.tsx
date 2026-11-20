"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card } from "./Card";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { api } from "../../services/api";
import Link from "next/link";

export function RegisterForm() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // إرسال البيانات للباك إند الخارجي
      const res = await api.post<{ token: string; user?: AuthUser }>("/auth/register", { name, email, password });

      // حفظ التوكن وبيانات المستخدم مباشرةً
      login(res.data.token, res.data.user);
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="إنشاء حساب جديد" className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <Input
          label="الاسم الكامل"
          type="text"
          placeholder="أحمد محمد"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
          {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
        </Button>

        <p className="text-sm text-center text-foreground/70 mt-2">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </Card>
  );
}