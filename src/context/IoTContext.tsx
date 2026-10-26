import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_BROKER_URL,
  MQTT_TOPICS,
} from '../config/mqtt';
import { mqttService } from '../services/mqttService';
import {
  storageService,
  type ThemePreference,
} from '../services/storageService';
import {
  getThemeColors,
  type ThemeColors,
  type ThemeMode,
} from '../themes/colors';
import type {
  ConnectionStatus,
  IncomingMqttMessage,
  LampState,
  MqttMessageRecord,
  SensorReading,
} from '../types/mqtt';
import { parseIncomingMessage } from '../utils/messageParser';

const HISTORY_LIMIT = 10;

interface IoTContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  brokerUrl: string;
  savedBrokerUrl: string;
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  lampState: LampState;
  lampUpdatedAt: string | null;
  history: MqttMessageRecord[];
  feedback: string | null;
  isHydrated: boolean;
  setBrokerUrlDraft: (value: string) => void;
  clearFeedback: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  publishLampCommand: (action: 'ON' | 'OFF') => Promise<boolean>;
  toggleTheme: () => Promise<void>;
  saveBrokerUrl: () => Promise<void>;
}

const IoTContext = createContext<IoTContextValue | null>(null);

const messageLabel = (action: 'ON' | 'OFF'): string =>
  action === 'ON' ? 'Ligar' : 'Desligar';

export function IoTProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemePreference>('light');
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER_URL);
  const [savedBrokerUrl, setSavedBrokerUrl] = useState(DEFAULT_BROKER_URL);
  const [temperature, setTemperature] = useState<SensorReading | null>(null);
  const [humidity, setHumidity] = useState<SensorReading | null>(null);
  const [lampState, setLampState] = useState<LampState>('UNKNOWN');
  const [lampUpdatedAt, setLampUpdatedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<MqttMessageRecord[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const mountedRef = useRef(false);
  const messageSequenceRef = useRef(0);

  const addHistory = useCallback(
    (record: Omit<MqttMessageRecord, 'id'>): void => {
      messageSequenceRef.current += 1;
      const item: MqttMessageRecord = {
        ...record,
        id: `${Date.now()}-${messageSequenceRef.current}`,
      };

      setHistory((current) => [item, ...current].slice(0, HISTORY_LIMIT));
    },
    [],
  );

  const handleStatusChange = useCallback(
    (status: ConnectionStatus, errorMessage?: string): void => {
      if (!mountedRef.current) {
        return;
      }

      setConnectionStatus(status);

      if (errorMessage) {
        setConnectionError(errorMessage);
      } else if (status === 'connected' || status === 'disconnected') {
        setConnectionError(null);
      }
    },
    [],
  );

  const handleIncomingMessage = useCallback(
    ({ topic, payload, receivedAt }: IncomingMqttMessage): void => {
      if (!mountedRef.current) {
        return;
      }

      const parsed = parseIncomingMessage(topic, payload, MQTT_TOPICS);

      addHistory({
        topic,
        payload,
        timestamp: receivedAt,
        direction: 'received',
        valid: parsed.ok,
      });

      if (!parsed.ok) {
        setFeedback(`Mensagem ignorada: ${parsed.error}`);
        return;
      }

      switch (parsed.message.kind) {
        case 'temperature':
          setTemperature({ value: parsed.message.value, updatedAt: receivedAt });
          break;
        case 'humidity':
          setHumidity({ value: parsed.message.value, updatedAt: receivedAt });
          break;
        case 'lampState':
          setLampState(parsed.message.state);
          setLampUpdatedAt(receivedAt);
          break;
      }
    },
    [addHistory],
  );

  const startConnection = useCallback(
    async (url: string): Promise<void> => {
      try {
        await mqttService.connect(url, MQTT_TOPICS, {
          onStatusChange: handleStatusChange,
          onMessage: handleIncomingMessage,
        });
      } catch (error) {
        if (mountedRef.current) {
          const message =
            error instanceof Error ? error.message : 'Não foi possível conectar.';
          setConnectionStatus('error');
          setConnectionError(message);
          setFeedback(message);
        }
      }
    },
    [handleIncomingMessage, handleStatusChange],
  );

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const hydrate = async (): Promise<void> => {
      const preferences = await storageService.loadPreferences();

      if (cancelled) {
        return;
      }

      setTheme(preferences.theme);
      setBrokerUrl(preferences.brokerUrl);
      setSavedBrokerUrl(preferences.brokerUrl);
      setIsHydrated(true);
      await startConnection(preferences.brokerUrl);
    };

    void hydrate();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      void mqttService.disconnect();
    };
  }, [startConnection]);

  const saveBrokerUrl = useCallback(async (): Promise<void> => {
    try {
      const normalizedUrl = await storageService.saveBrokerUrl(brokerUrl);

      if (!mountedRef.current) {
        return;
      }

      setBrokerUrl(normalizedUrl);
      setSavedBrokerUrl(normalizedUrl);
      setFeedback('URL do broker salva neste dispositivo.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível salvar a URL.';
      setFeedback(message);
    }
  }, [brokerUrl]);

  const connect = useCallback(async (): Promise<void> => {
    try {
      const normalizedUrl = await storageService.saveBrokerUrl(brokerUrl);

      if (!mountedRef.current) {
        return;
      }

      setBrokerUrl(normalizedUrl);
      setSavedBrokerUrl(normalizedUrl);
      setFeedback(null);
      await startConnection(normalizedUrl);
    } catch (error) {
      if (mountedRef.current) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível conectar.';
        setConnectionStatus('error');
        setConnectionError(message);
        setFeedback(message);
      }
    }
  }, [brokerUrl, startConnection]);

  const disconnect = useCallback(async (): Promise<void> => {
    await mqttService.disconnect();

    if (mountedRef.current) {
      setFeedback('Conexão encerrada.');
    }
  }, []);

  const publishLampCommand = useCallback(
    async (action: 'ON' | 'OFF'): Promise<boolean> => {
      const payload = JSON.stringify({ action });

      try {
        await mqttService.publish(MQTT_TOPICS.lampCommand, payload);

        if (!mountedRef.current) {
          return false;
        }

        addHistory({
          topic: MQTT_TOPICS.lampCommand,
          payload,
          timestamp: new Date().toISOString(),
          direction: 'sent',
          valid: true,
        });
        setFeedback(
          `Comando “${messageLabel(action)}” enviado. Aguardando confirmação do dispositivo.`,
        );
        return true;
      } catch (error) {
        if (mountedRef.current) {
          const message =
            error instanceof Error
              ? error.message
              : 'Não foi possível publicar o comando.';
          setFeedback(message);
        }
        return false;
      }
    },
    [addHistory],
  );

  const toggleTheme = useCallback(async (): Promise<void> => {
    const previousTheme = theme;
    const nextTheme: ThemePreference = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      await storageService.saveTheme(nextTheme);
    } catch {
      if (mountedRef.current) {
        setTheme(previousTheme);
        setFeedback('Não foi possível salvar a preferência de tema.');
      }
    }
  }, [theme]);

  const setBrokerUrlDraft = useCallback((value: string): void => {
    setBrokerUrl(value);
  }, []);

  const clearFeedback = useCallback((): void => {
    setFeedback(null);
  }, []);

  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const value = useMemo<IoTContextValue>(
    () => ({
      theme,
      colors,
      connectionStatus,
      connectionError,
      brokerUrl,
      savedBrokerUrl,
      temperature,
      humidity,
      lampState,
      lampUpdatedAt,
      history,
      feedback,
      isHydrated,
      setBrokerUrlDraft,
      clearFeedback,
      connect,
      disconnect,
      publishLampCommand,
      toggleTheme,
      saveBrokerUrl,
    }),
    [
      theme,
      colors,
      connectionStatus,
      connectionError,
      brokerUrl,
      savedBrokerUrl,
      temperature,
      humidity,
      lampState,
      lampUpdatedAt,
      history,
      feedback,
      isHydrated,
      setBrokerUrlDraft,
      clearFeedback,
      connect,
      disconnect,
      publishLampCommand,
      toggleTheme,
      saveBrokerUrl,
    ],
  );

  return <IoTContext.Provider value={value}>{children}</IoTContext.Provider>;
}

export function useIoT(): IoTContextValue {
  const context = useContext(IoTContext);

  if (!context) {
    throw new Error('useIoT precisa ser usado dentro de IoTProvider.');
  }

  return context;
}
