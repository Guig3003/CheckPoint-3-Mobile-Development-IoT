import type {
  MqttTopics,
  ParseIncomingMessageResult,
} from '../types/mqtt';
import { MQTT_TOPICS } from '../config/mqtt';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonObject = (payload: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(payload) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const invalid = (error: string): ParseIncomingMessageResult => ({
  ok: false,
  error,
});

export const parseIncomingMessage = (
  topic: string,
  payload: string,
  topics: MqttTopics = MQTT_TOPICS,
): ParseIncomingMessageResult => {
  const data = parseJsonObject(payload);

  if (!data) {
    return invalid('O payload recebido não é um objeto JSON válido.');
  }

  if (topic === topics.temperature) {
    if (typeof data.value !== 'number' || !Number.isFinite(data.value)) {
      return invalid('A temperatura precisa conter um campo numérico "value".');
    }

    return {
      ok: true,
      message: { kind: 'temperature', value: data.value },
    };
  }

  if (topic === topics.humidity) {
    if (
      typeof data.value !== 'number' ||
      !Number.isFinite(data.value) ||
      data.value < 0 ||
      data.value > 100
    ) {
      return invalid('A umidade precisa ter um "value" numérico entre 0 e 100.');
    }

    return {
      ok: true,
      message: { kind: 'humidity', value: data.value },
    };
  }

  if (topic === topics.lampState) {
    if (data.state !== 'ON' && data.state !== 'OFF') {
      return invalid('O estado da lâmpada precisa ser "ON" ou "OFF".');
    }

    return {
      ok: true,
      message: { kind: 'lampState', state: data.state },
    };
  }

  return invalid(`Tópico não reconhecido: ${topic}`);
};
