import Link from "next/link";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  return (
    <aside className={`w-64 border-l border-card-border bg-card p-4 flex flex-col gap-4 ${className}`}>
      {/* عنوان الداشبورد / الشعار */}
      <div className="text-xl font-bold px-2 text-primary">
        لوحة التحكم
      </div>

      {/* روابط القائمة الجانبية */}
      <nav className="flex flex-col gap-2 flex-1">
        <Link 
          href="/dashboard" 
          className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-background transition-colors"
        >
          الرئيسية
        </Link>
        <Link 
          href="/users" 
          className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-background transition-colors"
        >
          المستخدمين
        </Link>
        <Link 
          href="/settings" 
          className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-background transition-colors"
        >
          الإعدادات
        </Link>
      </nav>
    </aside>
  );
}