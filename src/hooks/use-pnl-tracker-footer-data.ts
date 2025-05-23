import { Wallet } from "@/apis/rest/wallet-manager";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useEffect, useMemo } from "react";

interface UsePnlTrackerFooterData {
  totalBalance: number;
  totalProfitAndLoss: number;
  totalProfitAndLossPercentage: number;
  solPrice: number;
  isLoading: boolean;
  handleWalletSelection: (wallets: Wallet[]) => void;
}

export const usePnlTrackerFooterData = (): UsePnlTrackerFooterData => {
  const { storedWallets } = usePnlSettings();
  const solPrice =
    useSolPriceMessageStore((state) => state.messages).price ??
    localStorage.getItem("current_solana_price");

  const {
    userWalletFullList,
    balance,
    isLoading,
    selectedMultipleActiveWalletPnLTracker,
    setSelectedMultipleActiveWalletPnLTracker,
  } = useUserWalletStore();

  const finalWallets = selectedMultipleActiveWalletPnLTracker?.filter(
    (w) => !w.archived,
  );

  const walletWithBalance = finalWallets?.map((wallet) => ({
    ...wallet,
    balance: String(balance[wallet.address] || "0"),
  })) as Wallet[];

  // Calculate total balance and related values
  const totalBalance = useMemo(() => {
    return walletWithBalance.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.balance ?? "0");
    }, 0);
  }, [finalWallets, balance]);

  const selectedAddresses = finalWallets.map((wallet) => wallet.address);

  const matchedWallets =
    storedWallets.length > 1
      ? storedWallets.filter((wallet) =>
          selectedAddresses.includes(wallet.address),
        )
      : [];

  const totalStoredBalance = useMemo(() => {
    return matchedWallets.reduce((sum, w) => {
      return sum + w.balance;
    }, 0);
  }, [storedWallets, matchedWallets]);

  // Calculate profit and loss values
  const totalProfitAndLoss = useMemo(() => {
    return totalBalance - totalStoredBalance;
  }, [totalBalance, totalStoredBalance]);

  const totalProfitAndLossPercentage = useMemo(() => {
    const amountLost = totalBalance - totalStoredBalance;

    return totalStoredBalance ? (amountLost / totalStoredBalance) * 100 : 0;
  }, [totalBalance, totalStoredBalance]);

  useEffect(() => {
    const savedWallets = localStorage.getItem("selected_wallet_pnl_tracker");
    if (savedWallets) {
      setSelectedMultipleActiveWalletPnLTracker(JSON.parse(savedWallets));
    } else {
      setSelectedMultipleActiveWalletPnLTracker(userWalletFullList);
    }
  }, []);

  const handleWalletSelection = (wallets: Wallet[]) => {
    setSelectedMultipleActiveWalletPnLTracker(wallets);
    localStorage.setItem(
      "selected_wallet_pnl_tracker",
      JSON.stringify(wallets),
    );
  };

  return {
    totalBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
    handleWalletSelection,
    solPrice,
    isLoading,
  };
};
