import type { MqttTopics } from '../types/mqtt';

export const DEFAULT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

export const MQTT_TOPIC_PREFIX =
  'fiap/3espx/iot-control-guilherme-oliveira';

export const MQTT_TOPICS: MqttTopics = {
  temperature: `${MQTT_TOPIC_PREFIX}/sensor/temperatura`,
  humidity: `${MQTT_TOPIC_PREFIX}/sensor/umidade`,
  lampCommand: `${MQTT_TOPIC_PREFIX}/lampada/comando`,
  lampState: `${MQTT_TOPIC_PREFIX}/lampada/estado`,
};

export const MQTT_INBOUND_TOPICS = [
  MQTT_TOPICS.temperature,
  MQTT_TOPICS.humidity,
  MQTT_TOPICS.lampState,
] as const;
