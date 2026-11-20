import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { usePathname, useRouter, Href } from "expo-router";
import ThemeToggleButton from "./ThemeToggleButton";

interface NavItem {
  label: string;
  href: Href;
}

const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الاستكشاف", href: "/explore" },
  { label: "حسابي", href: "/profile" },
];

export default function NavBar({ brandTitle = "تطبيقي" }: { brandTitle?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* اسم التطبيق */}
      <Text className="text-base font-bold text-slate-900 dark:text-white">
        {brandTitle}
      </Text>

      {/* روابط الصفحات الثلاث */}
      <View className="flex-row items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.href)}
              activeOpacity={0.75}
              className={`px-3 py-1.5 rounded-lg ${
                isActive
                  ? "bg-slate-900 dark:bg-white"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive
                    ? "text-white dark:text-slate-900"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* زر تبديل الليلي / النهاري */}
      <ThemeToggleButton />
    </View>
  );
}