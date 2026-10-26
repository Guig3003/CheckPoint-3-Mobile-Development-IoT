import mqtt from 'mqtt';

const brokerUrl =
  process.env.MQTT_URL ?? 'wss://broker.emqx.io:8084/mqtt';
const topicPrefix =
  process.env.MQTT_TOPIC_PREFIX ??
  'fiap/3espx/iot-control-guilherme-oliveira';
const telemetryIntervalMs = Number(
  process.env.TELEMETRY_INTERVAL_MS ?? 5_000,
);

const topics = {
  temperature: `${topicPrefix}/sensor/temperatura`,
  humidity: `${topicPrefix}/sensor/umidade`,
  lampCommand: `${topicPrefix}/lampada/comando`,
  lampState: `${topicPrefix}/lampada/estado`,
};

const clientId = `iot-simulator-${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 8)}`;

const client = mqtt.connect(brokerUrl, {
  clean: true,
  clientId,
  connectTimeout: 10_000,
  keepalive: 30,
  reconnectPeriod: 3_000,
});

let lampState = 'OFF';
let temperature = 24;
let humidity = 58;
let telemetryTimer;

const publishJson = (topic, payload, options = {}) => {
  client.publish(topic, JSON.stringify(payload), { qos: 1, ...options }, (error) => {
    if (error) {
      console.error(`[publish] ${topic}: ${error.message}`);
    }
  });
};

const publishTelemetry = () => {
  temperature = Math.min(
    32,
    Math.max(18, temperature + (Math.random() - 0.5) * 0.8),
  );
  humidity = Math.min(
    90,
    Math.max(30, humidity + (Math.random() - 0.5) * 2),
  );

  const temperaturePayload = { value: Number(temperature.toFixed(1)) };
  const humidityPayload = { value: Math.round(humidity) };

  publishJson(topics.temperature, temperaturePayload);
  publishJson(topics.humidity, humidityPayload);

  console.log(
    `[telemetria] ${temperaturePayload.value} °C | ${humidityPayload.value}%`,
  );
};

client.on('connect', () => {
  console.log(`[conectado] ${brokerUrl}`);
  console.log(`[prefixo] ${topicPrefix}`);

  client.subscribe(topics.lampCommand, { qos: 1 }, (error) => {
    if (error) {
      console.error(`[subscribe] ${error.message}`);
      return;
    }

    console.log(`[ouvindo] ${topics.lampCommand}`);
    publishJson(topics.lampState, { state: lampState }, { retain: true });
    publishTelemetry();

    clearInterval(telemetryTimer);
    telemetryTimer = setInterval(publishTelemetry, telemetryIntervalMs);
  });
});

client.on('message', (topic, payloadBuffer) => {
  if (topic !== topics.lampCommand) {
    return;
  }

  const rawPayload = payloadBuffer.toString();

  try {
    const payload = JSON.parse(rawPayload);

    if (payload?.action !== 'ON' && payload?.action !== 'OFF') {
      throw new Error('o campo action precisa ser ON ou OFF');
    }

    lampState = payload.action;
    console.log(`[comando] lâmpada ${lampState}`);
    publishJson(topics.lampState, { state: lampState }, { retain: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'payload inválido';
    console.error(`[comando inválido] ${rawPayload} (${message})`);
  }
});

client.on('reconnect', () => {
  console.log('[reconexão] tentando reconectar ao broker…');
});

client.on('offline', () => {
  console.warn('[offline] broker indisponível');
});

client.on('error', (error) => {
  console.error(`[mqtt] ${error.message}`);
});

const shutdown = () => {
  clearInterval(telemetryTimer);
  console.log('\n[encerrando] desconectando simulador…');
  client.end(false, () => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
