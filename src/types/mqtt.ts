export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type MessageDirection = 'sent' | 'received';

export type LampState = 'ON' | 'OFF' | 'UNKNOWN';

export type SensorKind = 'temperature' | 'humidity';

export interface MqttTopics {
  temperature: string;
  humidity: string;
  lampCommand: string;
  lampState: string;
}

export interface IncomingMqttMessage {
  topic: string;
  payload: string;
  receivedAt: string;
}

export interface MqttServiceHandlers {
  onStatusChange: (status: ConnectionStatus, errorMessage?: string) => void;
  onMessage: (message: IncomingMqttMessage) => void;
}

export interface SensorReading {
  value: number;
  updatedAt: string;
}

export interface LampReading {
  state: LampState;
  updatedAt: string | null;
}

export interface MqttMessageRecord {
  id: string;
  topic: string;
  payload: string;
  timestamp: string;
  direction: MessageDirection;
  valid: boolean;
}

export type ParsedIncomingMessage =
  | {
      kind: 'temperature';
      value: number;
    }
  | {
      kind: 'humidity';
      value: number;
    }
  | {
      kind: 'lampState';
      state: Exclude<LampState, 'UNKNOWN'>;
    };

export type ParseIncomingMessageResult =
  | {
      ok: true;
      message: ParsedIncomingMessage;
    }
  | {
      ok: false;
      error: string;
    };
