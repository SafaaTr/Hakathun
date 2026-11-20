import { Navbar } from "@/components/Navbar";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* الناف بار الخاص بالموقع العام */}
      <Navbar />
      
      {/* محتوى صفحات الويب */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* يمكنك إضافة Footer هنا للموقع العام */}
    </div>
  );
}