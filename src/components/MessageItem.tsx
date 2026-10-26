import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/themes/colors';

export interface MessageItemData {
  id: string;
  topic: string;
  payload: string;
  timestamp: string;
  direction: 'sent' | 'received';
  valid: boolean;
}

interface MessageItemProps {
  message: MessageItemData;
  colors: ThemeColors;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Horário indisponível';

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function MessageItem({ message, colors }: MessageItemProps) {
  const isReceived = message.direction === 'received';
  const accent = isReceived ? colors.info : colors.primary;
  const accentSoft = isReceived ? colors.infoSoft : colors.primarySoft;

  return (
    <View
      accessibilityLabel={`${isReceived ? 'Mensagem recebida' : 'Mensagem enviada'} no tópico ${message.topic}, às ${formatTimestamp(message.timestamp)}. Conteúdo: ${message.payload}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: message.valid ? colors.border : colors.danger,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.directionIcon, { backgroundColor: accentSoft }]}>
          <Ionicons
            color={accent}
            name={isReceived ? 'arrow-down' : 'arrow-up'}
            size={17}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.direction, { color: accent }]}>
            {isReceived ? 'RECEBIDA' : 'ENVIADA'}
          </Text>
          <Text style={[styles.time, { color: colors.textSubtle }]}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
        {!message.valid ? (
          <View style={[styles.invalidBadge, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons color={colors.danger} name="warning" size={13} />
            <Text style={[styles.invalidText, { color: colors.danger }]}>Inválida</Text>
          </View>
        ) : null}
      </View>

      <Text selectable style={[styles.topic, { color: colors.text }]}>
        {message.topic}
      </Text>
      <View style={[styles.payloadBox, { backgroundColor: colors.surfaceMuted }]}>
        <Text selectable style={[styles.payload, { color: colors.textMuted }]}>
          {message.payload}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  header: { alignItems: 'center', flexDirection: 'row' },
  directionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginLeft: 10 },
  direction: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  time: { marginTop: 2, fontSize: 11 },
  invalidBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  invalidText: { fontSize: 10, fontWeight: '800' },
  topic: { marginTop: 13, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  payloadBox: {
    marginTop: 9,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  payload: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
});
