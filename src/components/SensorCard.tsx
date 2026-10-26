import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/themes/colors';

type SensorKind = 'temperature' | 'humidity';

interface SensorCardProps {
  kind: SensorKind;
  value: number | null;
  updatedAt: string | null;
  colors: ThemeColors;
}

function formatTime(timestamp: string | null) {
  if (!timestamp) return 'Aguardando leitura';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Horário indisponível';

  return `Atualizado às ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

export function SensorCard({ kind, value, updatedAt, colors }: SensorCardProps) {
  const isTemperature = kind === 'temperature';
  const accent = isTemperature ? colors.temperature : colors.humidity;
  const soft = isTemperature ? colors.temperatureSoft : colors.humiditySoft;
  const label = isTemperature ? 'Temperatura' : 'Umidade';
  const unit = isTemperature ? '°C' : '%';
  const icon = isTemperature ? 'thermometer' : 'water';

  return (
    <View
      accessibilityLabel={`${label}: ${value === null ? 'sem leitura' : `${value}${unit}`}. ${formatTime(updatedAt)}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: soft }]}>
        <Ionicons color={accent} name={icon} size={22} />
      </View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>
          {value === null ? '—' : Number.isInteger(value) ? value : value.toFixed(1)}
        </Text>
        <Text style={[styles.unit, { color: accent }]}>{unit}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.timestamp, { color: colors.textSubtle }]}>
        {formatTime(updatedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    marginBottom: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '600' },
  valueRow: { marginTop: 2, alignItems: 'flex-start', flexDirection: 'row' },
  value: { fontSize: 32, fontWeight: '800', letterSpacing: -1, lineHeight: 39 },
  unit: { marginLeft: 3, marginTop: 5, fontSize: 15, fontWeight: '800' },
  timestamp: { marginTop: 9, fontSize: 10, lineHeight: 14 },
});
