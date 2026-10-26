import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SensorCard } from '@/components/SensorCard';
import { useIoT } from '@/context/IoTContext';
import type { LampState } from '@/types/mqtt';

function formatLampUpdate(timestamp: string | null) {
  if (!timestamp) return 'Aguardando confirmação do dispositivo';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Horário da confirmação indisponível';

  return `Confirmado às ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

export default function DashboardScreen() {
  const {
    colors,
    connectionStatus,
    connectionError,
    savedBrokerUrl,
    temperature,
    humidity,
    lampState,
    lampUpdatedAt,
    feedback,
    clearFeedback,
    isHydrated,
    connect,
    publishLampCommand,
  } = useIoT();
  const [sendingAction, setSendingAction] = useState<Exclude<LampState, 'UNKNOWN'> | null>(
    null,
  );

  const isConnected = connectionStatus === 'connected';

  async function sendLampCommand(action: Exclude<LampState, 'UNKNOWN'>) {
    setSendingAction(action);
    try {
      await publishLampCommand(action);
    } finally {
      setSendingAction(null);
    }
  }

  if (!isHydrated) {
    return (
      <SafeAreaView style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Carregando preferências…
        </Text>
      </SafeAreaView>
    );
  }

  const lampOn = lampState === 'ON';
  const lampAccent = lampState === 'UNKNOWN' ? colors.textSubtle : lampOn ? colors.lamp : colors.textMuted;
  const lampSoft = lampState === 'UNKNOWN' ? colors.surfaceStrong : lampOn ? colors.lampSoft : colors.surfaceMuted;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          colors={colors}
          eyebrow="IOT CONTROL"
          subtitle="Telemetria e controle do ambiente em tempo real."
          title="Olá, ambiente inteligente"
        />

        {feedback ? (
          <FeedbackBanner
            colors={colors}
            message={feedback}
            onDismiss={clearFeedback}
            tone={connectionStatus === 'error' ? 'error' : 'info'}
          />
        ) : null}

        <View
          style={[
            styles.connectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.connectionTopRow}>
            <View style={styles.connectionCopy}>
              <Text style={[styles.sectionKicker, { color: colors.textSubtle }]}>BROKER MQTT</Text>
              <ConnectionStatus colors={colors} status={connectionStatus} />
            </View>
            <View style={[styles.cloudIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons color={colors.primary} name="cloud" size={24} />
            </View>
          </View>
          <Text numberOfLines={2} selectable style={[styles.brokerUrl, { color: colors.textMuted }]}>
            {savedBrokerUrl}
          </Text>
          {connectionError ? (
            <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: colors.danger }]}>
              {connectionError}
            </Text>
          ) : null}
          {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
            <ActionButton
              accessibilityHint="Tenta conectar novamente ao broker configurado"
              colors={colors}
              icon="refresh"
              label="Reconectar"
              onPress={() => void connect()}
              style={styles.reconnectButton}
              variant="secondary"
            />
          ) : null}
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sensores</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            As leituras chegam automaticamente pelo broker.
          </Text>
        </View>
        <View style={styles.sensorGrid}>
          <SensorCard
            colors={colors}
            kind="temperature"
            updatedAt={temperature?.updatedAt ?? null}
            value={temperature?.value ?? null}
          />
          <SensorCard
            colors={colors}
            kind="humidity"
            updatedAt={humidity?.updatedAt ?? null}
            value={humidity?.value ?? null}
          />
        </View>

        <View
          style={[
            styles.lampCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.lampHeader}>
            <View style={[styles.lampIcon, { backgroundColor: lampSoft }]}>
              <Ionicons
                color={lampAccent}
                name={lampOn ? 'bulb' : 'bulb-outline'}
                size={28}
              />
            </View>
            <View style={styles.lampCopy}>
              <Text style={[styles.lampLabel, { color: colors.textMuted }]}>Lâmpada virtual</Text>
              <Text style={[styles.lampState, { color: colors.text }]}>
                {lampState === 'ON' ? 'Ligada' : lampState === 'OFF' ? 'Desligada' : 'Sem estado'}
              </Text>
              <Text style={[styles.lampTimestamp, { color: colors.textSubtle }]}>
                {formatLampUpdate(lampUpdatedAt)}
              </Text>
            </View>
          </View>

          <View style={[styles.confirmationNote, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons color={colors.info} name="shield-checkmark" size={18} />
            <Text style={[styles.confirmationText, { color: colors.textMuted }]}>
              O estado acima só muda após a confirmação recebida do simulador.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <ActionButton
              accessibilityHint="Publica o comando ON no tópico da lâmpada"
              colors={colors}
              disabled={!isConnected}
              icon="power"
              label="Ligar"
              loading={sendingAction === 'ON'}
              onPress={() => void sendLampCommand('ON')}
              style={styles.lampButton}
            />
            <ActionButton
              accessibilityHint="Publica o comando OFF no tópico da lâmpada"
              colors={colors}
              disabled={!isConnected}
              icon="moon-outline"
              label="Desligar"
              loading={sendingAction === 'OFF'}
              onPress={() => void sendLampCommand('OFF')}
              style={styles.lampButton}
              variant="ghost"
            />
          </View>
          {!isConnected ? (
            <Text style={[styles.disconnectedHint, { color: colors.warning }]}>
              Conecte-se ao broker para enviar comandos.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36, gap: 22 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '600' },
  connectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  connectionTopRow: { alignItems: 'flex-start', flexDirection: 'row' },
  connectionCopy: { flex: 1, gap: 8 },
  sectionKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  cloudIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  brokerUrl: { marginTop: 15, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  errorText: { marginTop: 10, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  reconnectButton: { marginTop: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.25 },
  sectionSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 19 },
  sensorGrid: { flexDirection: 'row', gap: 12 },
  lampCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  lampHeader: { alignItems: 'center', flexDirection: 'row' },
  lampIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  lampCopy: { flex: 1, marginLeft: 14 },
  lampLabel: { fontSize: 12, fontWeight: '600' },
  lampState: { marginTop: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.35 },
  lampTimestamp: { marginTop: 4, fontSize: 10 },
  confirmationNote: {
    marginTop: 17,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 9,
  },
  confirmationText: { flex: 1, fontSize: 12, lineHeight: 17 },
  buttonRow: { marginTop: 17, flexDirection: 'row', gap: 10 },
  lampButton: { flex: 1 },
  disconnectedHint: { marginTop: 11, textAlign: 'center', fontSize: 12, fontWeight: '600' },
});
