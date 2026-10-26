import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/themes/colors';

export type ConnectionStatusValue =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

interface ConnectionStatusProps {
  status: ConnectionStatusValue;
  colors: ThemeColors;
  compact?: boolean;
}

const labels: Record<ConnectionStatusValue, string> = {
  connecting: 'Conectando',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro de conexão',
};

export function ConnectionStatus({ status, colors, compact = false }: ConnectionStatusProps) {
  const tone =
    status === 'connected'
      ? colors.success
      : status === 'connecting'
        ? colors.warning
        : status === 'error'
          ? colors.danger
          : colors.textSubtle;
  const softTone =
    status === 'connected'
      ? colors.successSoft
      : status === 'connecting'
        ? colors.warningSoft
        : status === 'error'
          ? colors.dangerSoft
          : colors.surfaceStrong;
  const icon =
    status === 'connected'
      ? 'checkmark-circle'
      : status === 'connecting'
        ? 'sync'
        : status === 'error'
          ? 'alert-circle'
          : 'cloud-offline';

  return (
    <View
      accessibilityLabel={`Status MQTT: ${labels[status]}`}
      accessibilityRole="text"
      style={[styles.container, compact && styles.compact, { backgroundColor: softTone }]}
    >
      <Ionicons color={tone} name={icon} size={compact ? 15 : 18} />
      <Text style={[styles.label, compact && styles.compactLabel, { color: tone }]}>
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  compact: { minHeight: 30, paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontSize: 13, fontWeight: '700' },
  compactLabel: { fontSize: 12 },
});
