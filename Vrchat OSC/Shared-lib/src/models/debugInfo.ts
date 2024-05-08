export interface WebsocketWrapper {
  value: string;
  timestamp: Date;
  count: number;
}

export const defaultWebsocketWrapper = (value: string): WebsocketWrapper => {
  return {
    value: value,
    timestamp: new Date(),
    count: 0,
  };
};