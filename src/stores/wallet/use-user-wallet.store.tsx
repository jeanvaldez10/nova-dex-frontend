import { Wallet, WalletBalance } from "@/apis/rest/wallet-manager";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import { create } from "zustand";

export const showToastWallet = (variant: string) => {
  toast.custom((t: any) => (
    <CustomToast
      tVisibleState={t.visible}
      state={"ERROR"}
      message={`Please select at least one wallet ${variant}`}
    />
  ));
};

type UserWalletState = {
  balance: WalletBalance;
  setBalance: (balance: WalletBalance) => void;
  userWalletFullList: Wallet[];
  setWalletFullList: (walletList: Wallet[]) => void;
  activeWallet: Wallet;
  setActiveWallet: (walletType: Wallet) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // ########## Global🌐 ##########
  selectedMultipleActiveWallet: Wallet[];
  setSelectedMultipleActiveWallet: (walletList: Wallet[]) => void;
  // ########## Cosmo3️⃣ ##########
  selectedMultipleActiveWalletCosmo: Wallet[];
  setSelectedMultipleActiveWalletCosmo: (walletList: Wallet[]) => void;
  // ########## Trending1️⃣ ##########
  selectedMultipleActiveWalletTrending: Wallet[];
  setSelectedMultipleActiveWalletTrending: (walletList: Wallet[]) => void;
  // ########## Holdings✊ ##########
  selectedMultipleActiveWalletHoldings: Wallet[];
  setSelectedMultipleActiveWalletHoldings: (walletList: Wallet[]) => void;
  // ########## Token🪙 ##########
  selectedMultipleActiveWalletToken: Wallet[];
  setSelectedMultipleActiveWalletToken: (walletList: Wallet[]) => void;
  // ########## Token Buy n Sell🪙 ##########
  selectedMultipleActiveWalletBuySell: Wallet[];
  setSelectedMultipleActiveWalletBuySell: (walletList: Wallet[]) => void;
  // ########## Sniper🎯 ##########
  selectedMultipleActiveWalletSniper: Wallet[];
  setSelectedMultipleActiveWalletSniper: (walletList: Wallet[]) => void;
  // ########## PnL Tracker Footer Modal🎯 ##########
  selectedMultipleActiveWalletPnLTracker: Wallet[];
  setSelectedMultipleActiveWalletPnLTracker: (walletList: Wallet[]) => void;
};

export const useUserWalletStore = create<UserWalletState>((set) => ({
  balance: {} as WalletBalance,
  setBalance: (balance) =>
    set(() => ({
      balance: balance,
    })),
  activeWallet: {} as Wallet,
  setActiveWallet: (walletType) =>
    set(() => ({
      activeWallet: walletType,
    })),
  userWalletFullList: [],
  setWalletFullList: (walletList) =>
    set(() => ({
      userWalletFullList: walletList,
    })),
  isLoading: false,
  setIsLoading: (loading) =>
    set(() => ({
      isLoading: loading,
    })),
  // ########## Global🌐 ##########
  selectedMultipleActiveWallet: [],
  setSelectedMultipleActiveWallet: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWallet: walletList,
      }));
    // else showToastWallet("Global🌐");
  },
  // ########## Cosmo3️⃣ ##########
  selectedMultipleActiveWalletCosmo: [],
  setSelectedMultipleActiveWalletCosmo: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletCosmo: walletList,
      }));
    else showToastWallet("Cosmo3️⃣");
  },
  // ########## Trending1️⃣ ##########
  selectedMultipleActiveWalletTrending: [],
  setSelectedMultipleActiveWalletTrending: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletTrending: walletList,
      }));
    else showToastWallet("Trending1️⃣");
  },
  // ########## Holdings✊ ##########
  selectedMultipleActiveWalletHoldings: [],
  setSelectedMultipleActiveWalletHoldings: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletHoldings: walletList,
      }));
    else showToastWallet("Holdings✊");
  },
  // ########## Token🪙 ##########
  selectedMultipleActiveWalletToken: [],
  setSelectedMultipleActiveWalletToken: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletToken: walletList,
      }));
    else showToastWallet("Token🪙");
  },
  // ########## Token Buy n Sell🪙 ##########
  selectedMultipleActiveWalletBuySell: [],
  setSelectedMultipleActiveWalletBuySell: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletBuySell: walletList,
      }));
    else showToastWallet("Token🪙");
  },
  // ########## Sniper🎯 ##########
  selectedMultipleActiveWalletSniper: [],
  setSelectedMultipleActiveWalletSniper: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletSniper: walletList,
      }));
    else showToastWallet("Sniper🎯");
  },
  // ########## PnL Tracker Footer Modal🎯 ##########
  selectedMultipleActiveWalletPnLTracker: [],
  setSelectedMultipleActiveWalletPnLTracker: (walletList) => {
    if (walletList.length > 0)
      return set(() => ({
        selectedMultipleActiveWalletPnLTracker: walletList,
      }));
    else showToastWallet("PnL Tracker🎯");
  },
}));
