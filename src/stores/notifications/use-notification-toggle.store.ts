import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type NotificationToggleState = {
  // If isMuted is true, notifications (toasts) are not shown
  isMuted: boolean;
  // Toggle mute state
  toggleMute: () => void;
  // Set mute state explicitly
  setMuted: (value: boolean) => void;
};

export const useNotificationToggleStore = create<NotificationToggleState>()(
  persist(
    (set) => ({
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (value) => set(() => ({ isMuted: value })),
    }),
    {
      name: "notification-toggle-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
); 