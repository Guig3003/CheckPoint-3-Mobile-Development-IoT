import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/themes/colors';

interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  colors: ThemeColors;
  accessory?: ReactNode;
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  colors,
  accessory,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', flexDirection: 'row', gap: 16 },
  copy: { flex: 1 },
  eyebrow: { marginBottom: 7, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.6, lineHeight: 33 },
  subtitle: { marginTop: 7, fontSize: 14, lineHeight: 21 },
  accessory: { paddingTop: 4 },
});
