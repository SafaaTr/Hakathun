import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import NavBar from "../components/NavBar"; // عدّل المسار حسب مكان المكون

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50 dark:bg-slate-950">
        {/* أول التطبيق: شريط التنقل العلوي */}
        <NavBar brandTitle="تطبيقي" />

        {/* منطقة الصفحات */}
        <View className="flex-1">
          <Slot />
        </View>
      </SafeAreaView>
    </ThemeProvider>
  );
}