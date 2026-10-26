import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/themes/colors';

interface FeedbackBannerProps {
  message: string;
  colors: ThemeColors;
  onDismiss?: () => void;
  tone?: 'info' | 'error' | 'success';
}

export function FeedbackBanner({
  message,
  colors,
  onDismiss,
  tone = 'info',
}: FeedbackBannerProps) {
  const foreground =
    tone === 'error' ? colors.danger : tone === 'success' ? colors.success : colors.info;
  const background =
    tone === 'error'
      ? colors.dangerSoft
      : tone === 'success'
        ? colors.successSoft
        : colors.infoSoft;
  const icon =
    tone === 'error'
      ? 'alert-circle'
      : tone === 'success'
        ? 'checkmark-circle'
        : 'information-circle';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: background }]}
    >
      <Ionicons color={foreground} name={icon} size={20} />
      <Text style={[styles.message, { color: foreground }]}>{message}</Text>
      {onDismiss ? (
        <Pressable
          accessibilityLabel="Fechar aviso"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onDismiss}
          style={styles.dismiss}
        >
          <Ionicons color={foreground} name="close" size={19} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  message: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19 },
  dismiss: { padding: 1 },
});
