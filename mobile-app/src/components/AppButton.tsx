import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface AppButtonProps extends Omit<TouchableOpacityProps, "className"> {
  title: string;
  onPress: () => void;
  color?: string; // background color
  textColor?: string; // text color 
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export default function AppButton({
  title,
  onPress,
  color = "bg-[#EFBB44]",
  textColor = "text-slate-900",
  loading = false,
  disabled = false,
  className = "",
  textClassName = "",
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  let resolvedBg = "#EFBB44";
  if (color) {
    if (color.startsWith("#") || color.startsWith("rgb")) {
      resolvedBg = color;
    } else if (color.startsWith("bg-[") && color.endsWith("]")) {
      resolvedBg = color.slice(4, -1);
    }
  }

  let resolvedText = "#0F172A";
  if (textColor === "text-white" || textColor === "#FFFFFF" || textColor === "#fff") {
    resolvedText = "#FFFFFF";
  } else if (textColor?.startsWith("#") || textColor?.startsWith("rgb")) {
    resolvedText = textColor;
  }

  const bgClass = color?.startsWith("bg-") ? color : "";
  const txtClass = textColor?.startsWith("text-") ? textColor : "";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        {
          minHeight: 48,
          backgroundColor: resolvedBg,
        },
        style,
      ]}
      className={`py-3 px-4 rounded-xl flex-row items-center justify-center shadow-xs transition-all ${bgClass} ${
        isDisabled ? "opacity-60" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={resolvedText} />
      ) : (
        <Text
          style={{ color: resolvedText }}
          className={`text-sm font-extrabold ${txtClass} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}