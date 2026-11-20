import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

export function Navbar() {
    return (
        <header className="w-full border-b border-card-border bg-card/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* الشعار */}
                <Link href="/" className="text-xl font-bold text-foreground">
                    MyBrand
                </Link>

                {/* الروابط وزر التبديل */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-foreground/80 hover:text-primary transition-colors"
                    >
                        الرئيسية
                    </Link>
                    <Link
                        href="/about"
                        className="text-foreground/80 hover:text-primary transition-colors"
                    >
                        عن الشركة
                    </Link>

                    {/* استدعاء زر تغيير الثيم هنا */}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}