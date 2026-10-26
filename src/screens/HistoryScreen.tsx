import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageItem } from '@/components/MessageItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useIoT } from '@/context/IoTContext';
import type { MqttMessageRecord } from '@/types/mqtt';

export default function HistoryScreen() {
  const { colors, history } = useIoT();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList<MqttMessageRecord>
        contentContainerStyle={[styles.content, history.length === 0 && styles.emptyContent]}
        data={history}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons color={colors.primary} name="mail-open-outline" size={31} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma mensagem ainda</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Conecte o aplicativo e inicie o simulador. As mensagens enviadas e recebidas
              aparecerão aqui automaticamente.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <ScreenHeader
              accessory={
                <View style={[styles.counter, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.counterNumber, { color: colors.primary }]}>
                    {history.length}
                  </Text>
                  <Text style={[styles.counterLabel, { color: colors.primary }]}>de 10</Text>
                </View>
              }
              colors={colors}
              eyebrow="ATIVIDADE MQTT"
              subtitle="As dez mensagens mais recentes desta sessão."
              title="Histórico"
            />
            {history.length > 0 ? (
              <View style={[styles.legend, { borderColor: colors.border }]}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Recebida</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Enviada</Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <MessageItem colors={colors} message={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  emptyContent: { flexGrow: 1 },
  headerArea: { marginBottom: 22 },
  counter: {
    minWidth: 52,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  counterNumber: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  counterLabel: { marginTop: 1, fontSize: 9, fontWeight: '700' },
  legend: {
    marginTop: 18,
    borderTopWidth: 1,
    paddingTop: 13,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 17,
  },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600' },
  separator: { height: 12 },
  emptyState: { flex: 1, minHeight: 350, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 18, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyText: { marginTop: 8, maxWidth: 310, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
