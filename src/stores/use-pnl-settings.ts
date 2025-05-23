// ######## Libraries 📦 & Hooks 🪝 ########
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ######## Types 🗨️ ########
import {
  Display,
  Size,
} from "@/components/customs/modals/contents/footer/pnl-tracker/types";

const DEFAULT_PNL_SETTINGS = {
  selectedDisplayUSD: "Both",
  selectedTheme: "theme1",
};

interface StoredWallet {
  balance: number;
  address: string;
}
interface PNLSettingsState {
  userName: string;
  selectedDisplayUSD: Display;
  profilePicture: string;
  selectedTheme: string;
  size: Size;
  isOpen: boolean;
  storedWallets: StoredWallet[];
  activePnL: number;
}

interface PNLSettingsStore extends PNLSettingsState {
  setSize: (size: Size) => void;
  setActivePnL: (pnl: number) => void;
  setIsOpen: (state: boolean) => void;
  handleSavePNLSettings: (value: Partial<PNLSettingsState>) => void;
  handleResetPNLSettings: (storedWallets: StoredWallet[]) => void;
}

export const usePnlSettings = create<PNLSettingsStore>()(
  persist(
    (set) => ({
      selectedDisplayUSD: DEFAULT_PNL_SETTINGS.selectedDisplayUSD as Display,
      selectedTheme: DEFAULT_PNL_SETTINGS.selectedTheme,
      userName: "",
      profilePicture: "",
      size: { width: 457, height: 194 },
      isOpen: false,
      storedWallets: [],
      activePnL: 0,
      setActivePnL: (activePnL) => set(() => ({ activePnL })),
      setSize: (size) => set(() => ({ size })),
      setIsOpen: (state) => set(() => ({ isOpen: state })),
      handleSavePNLSettings: (values) =>
        set((state) => {
          let updatedValues = { ...values };
          if (
            values.selectedTheme &&
            values.selectedTheme === state.selectedTheme
          ) {
            updatedValues.size = state.size;
          }

          return { ...state, ...updatedValues };
        }),
      handleResetPNLSettings: (storedWallets) => set(() => ({ storedWallets })),
    }),
    {
      name: "pnl-settings",
    },
  ),
);
