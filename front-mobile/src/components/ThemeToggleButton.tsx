import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function ThemeToggleButton() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.75}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={20}
        color={isDark ? "#FBBF24" : "#334155"}
      />
    </TouchableOpacity>
  );
}