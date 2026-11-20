import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold text-foreground">مرحباً بك</h1>
        <p className="mt-4 text-lg text-foreground/70">
          أنشئ حساباً جديداً أو سجّل الدخول للمتابعة.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            إنشاء حساب جديد
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-card-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-card"
          >
            تسجيل الدخول
          </Link>
        </div>
      </section>
    </main>
  );
}
