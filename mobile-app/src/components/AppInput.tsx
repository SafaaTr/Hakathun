import React, { ReactNode, useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TextInputProps, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AppInputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  color?: string; // لون خلفية الحقل (bg-white)
  textColor?: string; // لون النص (text-slate-900)
  borderColor?: string; // لون الحدود (border-slate-300)
  placeholderColor?: string; // لون الـ placeholder مباشرة للـ TextInput
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap | string;
  leftIconColor?: string;
  rightAccessory?: ReactNode;
}

export default function AppInput({
  label,
  error,
  color,
  textColor,
  borderColor,
  placeholderColor = "#94A3B8",
  className = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  leftIcon,
  leftIconColor,
  rightAccessory,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      errorAnim.setValue(0);
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  const bgClass = color?.startsWith("bg-")
    ? color
    : "bg-slate-50 dark:bg-slate-800";
  const bgStyle =
    color && !color.startsWith("bg-") ? { backgroundColor: color } : undefined;

  const txtClass = textColor?.startsWith("text-")
    ? textColor
    : "text-[#2A4D75] dark:text-white";
  const txtStyle =
    textColor && !textColor.startsWith("text-") ? { color: textColor } : undefined;

  const bdrClass = borderColor?.startsWith("border-")
    ? borderColor
    : isFocused
    ? "border-[#EFBB44]"
    : "border-slate-200 dark:border-slate-700";
  const bdrStyle =
    borderColor && !borderColor.startsWith("border-")
      ? { borderColor }
      : isFocused && !borderColor
      ? { borderColor: "#EFBB44" }
      : undefined;

  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text
          className={`text-xs font-bold text-[#2A4D75] dark:text-slate-200 mb-1.5 ${labelClassName}`}
        >
          {label}
        </Text>
      ) : null}

      <View className="relative justify-center">
        {leftIcon ? (
          <View className="absolute left-3.5 z-10 items-center justify-center pointer-events-none">
            <Ionicons
              name={leftIcon as any}
              size={20}
              color={isFocused ? "#EFBB44" : leftIconColor || "#64748B"}
            />
          </View>
        ) : null}

        <TextInput
          placeholderTextColor={placeholderColor}
          style={[
            bgStyle,
            txtStyle,
            bdrStyle,
            { minHeight: 52, paddingVertical: 14 },
            style,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full text-sm font-medium rounded-xl border ${
            leftIcon ? "pl-11" : "pl-4"
          } ${rightAccessory ? "pr-12" : "pr-4"} ${bgClass} ${txtClass} ${bdrClass} ${
            error ? "border-red-500" : ""
          } ${inputClassName}`}
          {...rest}
        />

        {rightAccessory ? (
          <View className="absolute right-3.5 z-10 items-center justify-center">
            {rightAccessory}
          </View>
        ) : null}
      </View>

      {error ? (
        <Animated.View
          style={{
            opacity: errorAnim,
            transform: [
              {
                translateY: errorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-4, 0],
                }),
              },
            ],
          }}
        >
          <Text className={`text-xs text-red-500 font-semibold mt-1.5 ${errorClassName}`}>
            {error}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}