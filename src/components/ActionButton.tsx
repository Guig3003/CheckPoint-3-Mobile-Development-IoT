import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { ThemeColors } from '@/themes/colors';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  icon?: IoniconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

function resolvePalette(colors: ThemeColors, variant: ButtonVariant) {
  switch (variant) {
    case 'secondary':
      return { background: colors.primarySoft, pressed: colors.surfaceStrong, foreground: colors.primary, border: colors.primarySoft };
    case 'danger':
      return { background: colors.dangerSoft, pressed: colors.surfaceStrong, foreground: colors.danger, border: colors.dangerSoft };
    case 'ghost':
      return { background: 'transparent', pressed: colors.surfaceMuted, foreground: colors.textMuted, border: colors.border };
    default:
      return { background: colors.primary, pressed: colors.primaryPressed, foreground: colors.onPrimary, border: colors.primary };
  }
}

export function ActionButton({
  label,
  onPress,
  colors,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
  style,
}: ActionButtonProps) {
  const palette = resolvePalette(colors, variant);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? palette.pressed : palette.background,
          borderColor: palette.border,
          opacity: inactive ? 0.48 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} size="small" />
      ) : icon ? (
        <Ionicons color={palette.foreground} name={icon} size={19} />
      ) : null}
      <Text style={[styles.label, { color: palette.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.1 },
});
