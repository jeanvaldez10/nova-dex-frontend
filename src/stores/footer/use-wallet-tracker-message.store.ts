import { TrackedWallet, WalletTracker } from "@/apis/rest/wallet-tracker";
import { create } from "zustand";
import { deduplicateAndPrioritizeLatestData_WalletTracker } from "@/helpers/deduplicateAndPrioritizeLatestData";

type WalletTrackerMessageState = {
  messages: WalletTracker[];
  setMessages: (newMessages: WalletTracker[] | WalletTracker) => void;
  setInitMessages: (newMessages: WalletTracker[] | WalletTracker) => void;
  trackedWallets: TrackedWallet[];
  setTrackedWallets: (newTrackedWallets: TrackedWallet[]) => void;
  isExistingTx: (mint: string) => boolean;
};

export const useWalletTrackerMessageStore = create<WalletTrackerMessageState>()(
  (set, get) => ({
    messages: [],
    setMessages: (newMessages) =>
      set((state) => ({
        messages: [
          ...deduplicateAndPrioritizeLatestData_WalletTracker([
            ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
            ...state.messages,
          ]),
        ],
      })),
    setInitMessages: (newMessages) =>
      set({
        messages: Array.isArray(newMessages) ? newMessages : [newMessages],
      }),
    trackedWallets: [],
    setTrackedWallets: (newTrackedWallets) =>
      set((state) => ({
        ...state,
        trackedWallets: newTrackedWallets,
      })),
    isExistingTx: (mint: string) => {
      return get().messages.some(
        (tx: WalletTracker) => tx.mint === mint
      );
    }
  }),
);
