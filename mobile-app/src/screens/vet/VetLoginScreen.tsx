import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import {
  loginLegacyDoctor,
  LegacyDoctorLoginResult,
} from "../../services/legacyDoctorAuth";
import { colorPalette } from "../../constants/colors";

interface VetLoginScreenProps {
  onLoginSuccess?: (result: LegacyDoctorLoginResult) => void;
}

export default function VetLoginScreen({ onLoginSuccess }: VetLoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<string>("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (errorMsg) {
      errorAnim.setValue(0);
      Animated.spring(errorAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [errorMsg]);

  const handleLogin = async () => {
    setErrorMsg("");
    setSuccessInfo("");

    // التحقق الأساسي من إدخال رقم الهاتف وكلمة المرور
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone.trim()) || password.length < 8) {
      setErrorMsg("Invalid name or password. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginLegacyDoctor(phone, password);
      setSuccessInfo(`Welcome, ${result.doctor.name}`);
      onLoginSuccess?.(result);
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid name or password. Please re-enter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: "100%",
            maxWidth: 440,
            alignSelf: "center",
          }}
          className="gap-4"
        >
          <View className="mb-2">
            <Text className="text-xs uppercase font-extrabold tracking-widest text-[#557FB3]">
              VETERINARIAN ACCESS
            </Text>
            <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-1">
              Doctor Sign In
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Sign in with your phone number and password.
            </Text>
          </View>

          <View className="bg-[#EFBB44]/15 p-4 rounded-2xl flex-row items-center gap-3 border border-[#EFBB44]">
            <Ionicons name="medkit-outline" size={26} color="#EFBB44" />
            <Text className="text-sm font-bold text-[#2A4D75] dark:text-white flex-1">
              Manage your appointments, schedule, and clinic profile.
            </Text>
          </View>

          {errorMsg ? (
            <Animated.View
              style={{
                opacity: errorAnim,
                transform: [
                  {
                    scale: errorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }}
              className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 flex-row items-center gap-2.5 shadow-xs"
            >
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text className="text-xs font-bold text-red-700 dark:text-red-300 flex-1">
                {errorMsg}
              </Text>
            </Animated.View>
          ) : null}

          {successInfo ? (
            <View className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 flex-row items-center gap-2.5">
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text className="text-xs font-bold text-emerald-800">
                {successInfo}
              </Text>
            </View>
          ) : null}

          <View className="gap-3.5 bg-white dark:bg-[#1E2733] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <AppInput
              label="Phone number"
              leftIcon="call-outline"
              placeholder="09XXXXXXXX"
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                if (errorMsg) setErrorMsg("");
              }}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <AppInput
              label="Password"
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errorMsg) setErrorMsg("");
              }}
              secureTextEntry={!showPassword}
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowPassword((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  activeOpacity={0.7}
                  className="w-9 h-9 items-center justify-center rounded-lg"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              }
            />

            <AppButton
              title={loading ? "Signing in..." : "Log In"}
              onPress={handleLogin}
              loading={loading}
              color="bg-[#EFBB44]"
              textColor="text-slate-900"
              textClassName="font-extrabold text-base"
              className="mt-2"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}