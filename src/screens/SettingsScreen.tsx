import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MQTT_TOPICS, MQTT_TOPIC_PREFIX } from '@/config/mqtt';
import { useIoT } from '@/context/IoTContext';

type PendingAction = 'save' | 'connect' | 'disconnect' | null;

const topicRows = [
  { label: 'Temperatura', topic: MQTT_TOPICS.temperature, direction: 'Subscribe' },
  { label: 'Umidade', topic: MQTT_TOPICS.humidity, direction: 'Subscribe' },
  { label: 'Comando da lâmpada', topic: MQTT_TOPICS.lampCommand, direction: 'Publish' },
  { label: 'Estado da lâmpada', topic: MQTT_TOPICS.lampState, direction: 'Subscribe' },
] as const;

export default function SettingsScreen() {
  const {
    theme,
    colors,
    connectionStatus,
    connectionError,
    brokerUrl,
    setBrokerUrlDraft,
    savedBrokerUrl,
    feedback,
    clearFeedback,
    connect,
    disconnect,
    toggleTheme,
    saveBrokerUrl,
  } = useIoT();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const hasBrokerUrl = brokerUrl.trim().length > 0;
  const hasUnsavedChanges = brokerUrl.trim() !== savedBrokerUrl;

  async function handleSave() {
    setPendingAction('save');
    try {
      await saveBrokerUrl();
    } finally {
      setPendingAction(null);
    }
  }

  async function handleConnect() {
    setPendingAction('connect');
    try {
      await saveBrokerUrl();
      await connect();
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDisconnect() {
    setPendingAction('disconnect');
    try {
      await disconnect();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            colors={colors}
            eyebrow="PREFERÊNCIAS"
            subtitle="Defina a conexão e adapte o painel ao seu ambiente."
            title="Configurações"
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
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
            ]}
          >
            <View style={styles.cardHeading}>
              <View style={[styles.headingIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons color={colors.primary} name="cloud-outline" size={21} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Broker MQTT</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Conexão via WebSocket</Text>
              </View>
              <ConnectionStatus colors={colors} compact status={connectionStatus} />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>URL WebSocket</Text>
            <TextInput
              accessibilityHint="Informe um endereço começando com ws ou wss"
              accessibilityLabel="URL WebSocket do broker MQTT"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onChangeText={setBrokerUrlDraft}
              onSubmitEditing={() => void handleSave()}
              placeholder="wss://broker.exemplo.com:8084/mqtt"
              placeholderTextColor={colors.placeholder}
              returnKeyType="done"
              selectionColor={colors.primary}
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              value={brokerUrl}
            />
            <View style={styles.inputMeta}>
              <Text style={[styles.helperText, { color: colors.textSubtle }]}>Use ws:// ou wss:// e a porta WebSocket do broker.</Text>
              {hasUnsavedChanges ? (
                <Text style={[styles.unsavedText, { color: colors.warning }]}>Não salvo</Text>
              ) : null}
            </View>

            {connectionError ? (
              <View style={[styles.inlineError, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons color={colors.danger} name="alert-circle" size={17} />
                <Text style={[styles.inlineErrorText, { color: colors.danger }]}>{connectionError}</Text>
              </View>
            ) : null}

            <ActionButton
              colors={colors}
              disabled={!hasBrokerUrl || !hasUnsavedChanges}
              icon="save-outline"
              label="Salvar endereço"
              loading={pendingAction === 'save'}
              onPress={() => void handleSave()}
              style={styles.fullButton}
              variant="secondary"
            />
            <View style={styles.connectionButtons}>
              <ActionButton
                colors={colors}
                disabled={!hasBrokerUrl || connectionStatus === 'connecting'}
                icon={connectionStatus === 'connected' ? 'refresh' : 'flash'}
                label={connectionStatus === 'connected' ? 'Reconectar' : 'Conectar'}
                loading={pendingAction === 'connect' || connectionStatus === 'connecting'}
                onPress={() => void handleConnect()}
                style={styles.connectionButton}
              />
              <ActionButton
                colors={colors}
                disabled={connectionStatus === 'disconnected'}
                icon="stop-circle-outline"
                label="Desconectar"
                loading={pendingAction === 'disconnect'}
                onPress={() => void handleDisconnect()}
                style={styles.connectionButton}
                variant="danger"
              />
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
            ]}
          >
            <View style={styles.preferenceRow}>
              <View style={[styles.headingIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons
                  color={colors.primary}
                  name={theme === 'dark' ? 'moon' : 'sunny'}
                  size={21}
                />
              </View>
              <View style={styles.preferenceCopy}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Tema escuro</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  {theme === 'dark' ? 'Ativado em todas as telas' : 'Tema claro em uso'}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Alternar tema escuro"
                ios_backgroundColor={colors.surfaceStrong}
                onValueChange={() => void toggleTheme()}
                thumbColor={theme === 'dark' ? colors.primary : colors.surface}
                trackColor={{ false: colors.surfaceStrong, true: colors.primarySoft }}
                value={theme === 'dark'}
              />
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
            ]}
          >
            <View style={styles.cardHeading}>
              <View style={[styles.headingIcon, { backgroundColor: colors.infoSoft }]}>
                <Ionicons color={colors.info} name="git-network-outline" size={21} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Tópicos do projeto</Text>
                <Text numberOfLines={1} selectable style={[styles.topicPrefix, { color: colors.textMuted }]}>
                  {MQTT_TOPIC_PREFIX}
                </Text>
              </View>
            </View>

            <View style={styles.topicList}>
              {topicRows.map((row, index) => (
                <View
                  key={row.topic}
                  style={[
                    styles.topicRow,
                    index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                  ]}
                >
                  <View style={styles.topicCopy}>
                    <Text style={[styles.topicLabel, { color: colors.text }]}>{row.label}</Text>
                    <Text selectable style={[styles.topicValue, { color: colors.textMuted }]}>
                      {row.topic}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.directionBadge,
                      { backgroundColor: row.direction === 'Publish' ? colors.primarySoft : colors.infoSoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.directionText,
                        { color: row.direction === 'Publish' ? colors.primary : colors.info },
                      ]}
                    >
                      {row.direction}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.footer, { color: colors.textSubtle }]}>IoT Control · Expo + TypeScript + MQTT</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40, gap: 20 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeading: { alignItems: 'center', flexDirection: 'row' },
  headingIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  inputLabel: { marginTop: 20, marginBottom: 8, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 13 },
  inputMeta: { marginTop: 7, alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  helperText: { flex: 1, fontSize: 10, lineHeight: 15 },
  unsavedText: { fontSize: 10, fontWeight: '800' },
  inlineError: { marginTop: 12, borderRadius: 12, padding: 11, alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  inlineErrorText: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },
  fullButton: { marginTop: 15 },
  connectionButtons: { marginTop: 10, flexDirection: 'row', gap: 10 },
  connectionButton: { flex: 1, paddingHorizontal: 10 },
  preferenceRow: { alignItems: 'center', flexDirection: 'row' },
  preferenceCopy: { flex: 1, marginLeft: 12, marginRight: 12 },
  topicPrefix: { marginTop: 3, fontFamily: 'monospace', fontSize: 10 },
  topicList: { marginTop: 17 },
  topicRow: { minHeight: 67, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', gap: 10 },
  topicCopy: { flex: 1 },
  topicLabel: { fontSize: 12, fontWeight: '700' },
  topicValue: { marginTop: 4, fontFamily: 'monospace', fontSize: 9, lineHeight: 14 },
  directionBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  directionText: { fontSize: 9, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 11 },
});
