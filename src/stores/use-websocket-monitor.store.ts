import { create } from "zustand";

type WebsocketError = {
  message: string;
  code?: number;
  timestamp: Date;
};

type WebsocketState = {
  lastMessageTimestamp: Date | null;
  connectedTimestamp: Date | null;
  status: "connecting" | "connected" | "closing" | "disconnected" | "reconnecting" | "unknown";
  retryCount: number;
  error: WebsocketError[];
};

export type WebsocketName =
  | "allws"
  | "notification"
  | "twitterMonitor"
  | "cosmo"
  | "holding"
  | "trending"
  | "chartToken"
  | "tokenInfo"
  | "tokenHolding";

const websocketNames: WebsocketName[] = [
  "allws",
  "notification",
  "twitterMonitor",
  "cosmo",
  "holding",
  "trending",
  "chartToken",
  "tokenInfo",
  "tokenHolding",
];

const defaultWebsocketState: WebsocketState = {
  lastMessageTimestamp: null,
  connectedTimestamp: null,
  status: "unknown",
  retryCount: 0,
  error: [],
};

type WebsocketStore = {
  [key in WebsocketName]: WebsocketState;
} & {
  setWebsocketState: (name: WebsocketName, state: Partial<WebsocketState>) => void;
  resetWebsocketState: (name: WebsocketName) => void;
  resetAllWebsocketStates: () => void;
  addError: (name: WebsocketName, error: WebsocketError) => void;
  clearErrors: (name: WebsocketName) => void;
  clearAllErrors: () => void;
  updateLastMessageTimestamp: (name: WebsocketName, timestamp: Date) => void;
  updateConnectedTimestamp: (name: WebsocketName, timestamp: Date) => void;
};

export const useWebsocketMonitor = create<WebsocketStore>((set) => {
  // Initialize all websocket states with default
  const initialState = Object.fromEntries(
    websocketNames.map((name) => [name, { ...defaultWebsocketState }])
  ) as Pick<WebsocketStore, WebsocketName>;

  return {
    ...initialState,

    setWebsocketState: (name, state) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          ...state,
        },
      })),

    resetWebsocketState: (name) =>
      set(() => ({
        [name]: { ...defaultWebsocketState },
      })),

    resetAllWebsocketStates: () =>
      set(() => {
        const resetStates = Object.fromEntries(
          (Object.keys(initialState) as WebsocketName[]).map((name) => [name, { ...defaultWebsocketState }])
        );
        return resetStates;
      }),

    addError: (name, error) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          error: [...prev[name].error, error],
        },
      })),

    clearErrors: (name) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          error: [],
        },
      })),

    clearAllErrors: () =>
      set((prev) => {
        const cleared = Object.fromEntries(
          (Object.keys(initialState) as WebsocketName[]).map((name) => [
            name,
            { ...prev[name], error: [] },
          ])
        );
        return cleared;
      }),

    updateLastMessageTimestamp: (name, timestamp) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          lastMessageTimestamp: timestamp,
        },
      })),

    updateConnectedTimestamp: (name, timestamp) =>
      set((prev) => ({
        [name]: {
          ...prev[name],
          connectedTimestamp: timestamp,
        },
      })),
  };
});
