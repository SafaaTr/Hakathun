import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* استدعاء مكوّن Sidebar المستقل */}
      <Sidebar />

      {/* المنطقة الرئيسية للداشبورد */}
      <div className="flex-1 flex flex-col">
        {/* Header الخاص بالداشبورد */}
        <header className="h-16 border-b border-card-border bg-card px-6 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground">أهلاً بك</h2>
          <ThemeToggle />
        </header>

        {/* محتوى صفحات الداشبورد */}
        <main className="p-6 flex-1 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}