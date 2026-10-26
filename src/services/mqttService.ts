import mqtt, { type MqttClient } from 'mqtt';

import type {
  MqttServiceHandlers,
  MqttTopics,
} from '../types/mqtt';

const CONNECTION_OPTIONS = {
  clean: true,
  connectTimeout: 10_000,
  forceNativeWebSocket: true,
  keepalive: 30,
  protocolVersion: 4 as const,
  queueQoSZero: false,
  reconnectPeriod: 3_000,
  resubscribe: false,
  timerVariant: 'native' as const,
};

const createClientId = (): string => {
  const timestamp = Date.now().toString(36).slice(-6);
  const random = Math.random().toString(36).slice(2, 8);
  return `iot-${timestamp}-${random}`;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Falha MQTT desconhecida.';

export const normalizeBrokerUrl = (brokerUrl: string): string => {
  const normalizedUrl = brokerUrl.trim();

  if (!normalizedUrl) {
    throw new Error('Informe a URL WebSocket do broker.');
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    throw new Error('A URL do broker é inválida.');
  }

  if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
    throw new Error('Use uma URL MQTT WebSocket iniciada por ws:// ou wss://.');
  }

  if (!parsedUrl.hostname) {
    throw new Error('A URL do broker precisa conter um host.');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('Não inclua credenciais diretamente na URL do broker.');
  }

  return normalizedUrl;
};

export class MqttService {
  private client: MqttClient | null = null;

  private generation = 0;

  private handlers: MqttServiceHandlers | null = null;

  private topics: MqttTopics | null = null;

  get isConnected(): boolean {
    return this.client?.connected === true;
  }

  async connect(
    brokerUrl: string,
    topics: MqttTopics,
    handlers: MqttServiceHandlers,
  ): Promise<void> {
    let normalizedUrl: string;

    try {
      normalizedUrl = normalizeBrokerUrl(brokerUrl);
    } catch (error) {
      handlers.onStatusChange('error', getErrorMessage(error));
      throw error;
    }

    await this.disposeClient();

    const generation = ++this.generation;
    this.handlers = handlers;
    this.topics = topics;
    handlers.onStatusChange('connecting');

    let client: MqttClient;

    try {
      client = mqtt.connect(normalizedUrl, {
        ...CONNECTION_OPTIONS,
        clientId: createClientId(),
      });
    } catch (error) {
      handlers.onStatusChange('error', getErrorMessage(error));
      throw error;
    }

    this.client = client;

    const isCurrentConnection = (): boolean =>
      this.generation === generation && this.client === client;

    client.on('connect', () => {
      void this.subscribeToInboundTopics(client, topics, handlers, generation);
    });

    client.on('message', (topic, payload) => {
      if (!isCurrentConnection()) {
        return;
      }

      handlers.onMessage({
        topic,
        payload: payload.toString(),
        receivedAt: new Date().toISOString(),
      });
    });

    client.on('reconnect', () => {
      if (isCurrentConnection()) {
        handlers.onStatusChange('connecting');
      }
    });

    client.on('offline', () => {
      if (isCurrentConnection()) {
        handlers.onStatusChange(
          'connecting',
          'Broker indisponível. Tentando reconectar…',
        );
      }
    });

    client.on('close', () => {
      if (isCurrentConnection()) {
        handlers.onStatusChange(
          'connecting',
          'Conexão interrompida. Tentando reconectar…',
        );
      }
    });

    client.on('error', (error) => {
      if (isCurrentConnection()) {
        handlers.onStatusChange('error', getErrorMessage(error));
      }
    });
  }

  async publish(topic: string, payload: string): Promise<void> {
    const client = this.client;

    if (!client?.connected) {
      throw new Error('Conecte ao broker antes de publicar um comando.');
    }

    await client.publishAsync(topic, payload, {
      qos: 1,
      retain: false,
    });
  }

  async disconnect(): Promise<void> {
    const handlers = this.handlers;
    await this.disposeClient();
    handlers?.onStatusChange('disconnected');
  }

  private async subscribeToInboundTopics(
    client: MqttClient,
    topics: MqttTopics,
    handlers: MqttServiceHandlers,
    generation: number,
  ): Promise<void> {
    const isCurrentConnection = (): boolean =>
      this.generation === generation && this.client === client;

    try {
      await client.subscribeAsync(
        [topics.temperature, topics.humidity, topics.lampState],
        { qos: 1 },
      );

      if (isCurrentConnection() && client.connected) {
        handlers.onStatusChange('connected');
      }
    } catch (error) {
      if (isCurrentConnection()) {
        handlers.onStatusChange(
          'error',
          `Falha ao assinar os tópicos: ${getErrorMessage(error)}`,
        );
      }
    }
  }

  private async disposeClient(): Promise<void> {
    const client = this.client;
    const topics = this.topics;

    this.generation += 1;
    this.client = null;
    this.handlers = null;
    this.topics = null;

    if (!client) {
      return;
    }

    if (client.connected && topics) {
      try {
        await client.unsubscribeAsync([
          topics.temperature,
          topics.humidity,
          topics.lampState,
        ]);
      } catch {
        // Encerrar a sessão ainda remove as inscrições de uma conexão clean.
      }
    }

    client.removeAllListeners();

    try {
      await client.endAsync(true);
    } catch {
      // A referência e os listeners já foram removidos; não há sessão a reutilizar.
    }
  }
}

export const mqttService = new MqttService();
