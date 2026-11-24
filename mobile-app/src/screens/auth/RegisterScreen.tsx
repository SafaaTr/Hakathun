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
import AppCard from "../../components/AppCard";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { useAuth } from "../../context/AuthContext";

interface RegisterScreenProps {
  navigation: {
    navigate: (routeName: string, params?: any) => void;
    goBack?: () => void;
  };
}

const NAME_REGEX = /^[A-Za-z\u0600-\u06FF\s]+$/;
const PHONE_REGEX = /^09\d{8}$/;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { register, loading } = useAuth();

  // Entrance animation for content card
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  // Dynamic error banner animation
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
    if (errorMessage) {
      errorAnim.setValue(0);
      Animated.spring(errorAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [errorMessage]);

  const handleRegister = async () => {
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedName) {
      setErrorMessage("Name field is empty.");
      return;
    }
    if (!trimmedPhone) {
      setErrorMessage("Phone field is empty.");
      return;
    }
    if (!trimmedPassword) {
      setErrorMessage("Password field is empty.");
      return;
    }
    if (!trimmedConfirm) {
      setErrorMessage("Confirm Password field is empty.");
      return;
    }

    const isValidName = NAME_REGEX.test(trimmedName);
    const isValidPhone = PHONE_REGEX.test(trimmedPhone);
    const isValidPassword =
      trimmedPassword.length >= 8 && trimmedPassword === trimmedConfirm;

    if (!isValidName) {
      setErrorMessage("Invalid name format.");
      return;
    }
    if (!isValidPhone) {
      setErrorMessage("Phone must be 10 digits starting with 09.");
      return;
    }
    if (!isValidPassword) {
      setErrorMessage(
        "Password must be at least 8 characters and match Confirm Password."
      );
      return;
    }

    try {
      const createdUser: any = await register(
        trimmedName,
        trimmedPhone,
        trimmedPassword,
        trimmedConfirm
      );
      void createdUser;
      navigation.navigate("Login");
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Could not create account. Please try again."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 32,
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
          {/* Top Header */}
          <View className="items-center mb-1">
            <View className="w-16 h-16 rounded-2xl bg-[#EFBB44]/20 items-center justify-center mb-2.5 border border-[#EFBB44]/40">
              <Ionicons name="person-add" size={30} color="#EFBB44" />
            </View>
            <Text className="text-xs uppercase font-extrabold tracking-widest text-[#557FB3]">
              PET OWNER REGISTRATION
            </Text>
            <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
              Create Account
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
              Join Rafeeq to care for your beloved pets
            </Text>
          </View>

          {/* Animated Error Banner */}
          {errorMessage ? (
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
                {errorMessage}
              </Text>
            </Animated.View>
          ) : null}

          {/* Form Card */}
          <AppCard
            color="bg-white dark:bg-[#1E2733]"
            className="gap-3.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            {/* Full Name Input with Icon */}
            <AppInput
              label="Full Name"
              leftIcon="person-outline"
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Name (Arabic or English)"
            />

            {/* Phone Input with Icon */}
            <AppInput
              label="Phone Number"
              leftIcon="call-outline"
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="09XXXXXXXX"
              keyboardType="phone-pad"
              maxLength={10}
            />

            {/* Password Input with Icon & Toggle */}
            <AppInput
              label="Password"
              leftIcon="lock-closed-outline"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Min 8 characters"
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

            {/* Confirm Password Input with Icon & Toggle */}
            <AppInput
              label="Confirm Password"
              leftIcon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={(txt) => {
                setConfirmPassword(txt);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  activeOpacity={0.7}
                  className="w-9 h-9 items-center justify-center rounded-lg"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              }
            />

            {/* Register Button with #EFBB44 and High Contrast Text */}
            <AppButton
              title={loading ? "Creating account..." : "Register"}
              onPress={handleRegister}
              disabled={loading}
              color="bg-[#EFBB44]"
              textColor="text-slate-900"
              textClassName="font-extrabold text-base"
              className="mt-2"
            />
          </AppCard>

          {/* Switch to Login Screen */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
            className="items-center justify-center py-3.5 px-4 rounded-xl border border-[#EFBB44] bg-[#EFBB44]/10 dark:bg-[#EFBB44]/15 shadow-xs"
          >
            <Text className="text-xs font-extrabold text-[#2A4D75] dark:text-[#EFBB44] text-center">
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}