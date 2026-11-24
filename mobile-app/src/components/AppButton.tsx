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
  color?: string; // لون خلفية 
  textColor?: string; // لون نص 
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

  const bgClass = color?.startsWith("bg-") ? color : "";
  const bgStyle =
    color && !color.startsWith("bg-")
      ? { backgroundColor: color }
      : !color
      ? { backgroundColor: "#EFBB44" }
      : undefined;

  const txtClass = textColor?.startsWith("text-") ? textColor : "";
  const txtStyle =
    textColor && !textColor.startsWith("text-") ? { color: textColor } : undefined;

  const loaderColor =
    textColor && !textColor.startsWith("text-") ? textColor : "#0F172A";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        {
          minHeight: 50,
          backgroundColor: !bgClass && !bgStyle ? "#EFBB44" : undefined,
        },
        bgStyle,
        style,
      ]}
      className={`py-3.5 px-5 rounded-xl flex-row items-center justify-center shadow-xs transition-all ${bgClass} ${
        isDisabled ? "opacity-60" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text
          style={txtStyle}
          className={`text-base font-extrabold ${txtClass} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}