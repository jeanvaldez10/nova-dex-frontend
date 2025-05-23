"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useHoldingsMarqueeSortStore } from "@/stores/holdings/use-holdings-marquee-sort.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
// ######## Components 🧩 #########
import Link from "next/link";
import Image from "next/image";
import QuickClipboard from "@/components/customs/QuickClipboard";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
// ######## Constants ☑️ ########
import { dummyHoldingsMarqueeData } from "@/constants/dummy-data";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/apis/rest/wallet-manager";

type MarqueeItemProps = {
  image: string;
  tokenSymbol: string;
  remainingSol: number;
  percentage: number;
  mint: string;
};

const MarqueeItem = React.memo(
  ({
    image,
    tokenSymbol,
    remainingSol,
    percentage,
    mint,
  }: MarqueeItemProps) => {
    return (
      <Link
        href={`/token/${mint}`}
        prefetch
        className="flex flex-shrink-0 items-center justify-center gap-x-1 border-r border-border pl-1.5 pr-2 hover:cursor-pointer"
      >
        <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src={image}
            alt="Token Image"
            fill
            quality={100}
            unoptimized={true}
            className="object-contain"
          />
        </div>
        <span className="font-geistMonoLight text-xs text-fontColorPrimary">
          {truncateString(tokenSymbol, 5)}
        </span>
        <span className="font-geistMonoLight text-xs text-fontColorSecondary">
          {formatAmountWithoutLeadingZero(Number(remainingSol))}
        </span>
        <span
          className={cn(
            "font-geistMonoLight text-xs",
            percentage > 0 ? "text-success" : "text-destructive",
          )}
        >
          {percentage > 0 ? "+" : ""}
          {percentage.toFixed(2)}%
        </span>
      </Link>
    );
  },
);

MarqueeItem.displayName = "MarqueeItem";

export default function HoldingsMarquee() {
  const pathname = usePathname();

  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  const setSelectedWallet = useUserWalletStore(
    (state) => state.setActiveWallet,
  );
  const selectedWallet = useUserWalletStore((state) => state.activeWallet);
  const sortType = useHoldingsMarqueeSortStore((state) => state.sortType);
  const setSortType = useHoldingsMarqueeSortStore((state) => state.setSortType);

  const hiddenTokenList = useHoldingsHideStore(
    (state) => state.hiddenTokenList,
  );

  useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await getWallets();
      const selectedWallet = res.find((w) => w.selected);
      if (selectedWallet) {
        setSelectedWallet(selectedWallet);
      }
      return res;
    },
  });

  const finalHoldings = useMemo(() => {
    if (!holdingsMessages.length) return [];

    return holdingsMessages
      .map((cm) => ({
        ...cm,
        tokens: cm.tokens?.filter((token) => token.balance !== 0),
      }))
      ?.filter((cm) => cm.tokens.length > 0);
  }, [holdingsMessages]);

  const holdingsBasedOnSelectedWallet = useMemo(
    () =>
      finalHoldings?.find(
        (holdings) => holdings.wallet === selectedWallet.address,
      ),
    [finalHoldings, selectedWallet.address],
  );

  const filteredAndSortedTokens = useMemo(
    () =>
      holdingsBasedOnSelectedWallet?.tokens
        ?.filter((t: any) => !hiddenTokenList.includes(t.token.mint))
        .sort((a, b) =>
          sortType == "amount"
            ? b.balance - a.balance
            : b.lastBought - a.lastBought,
        ),
    [holdingsBasedOnSelectedWallet?.tokens, hiddenTokenList, sortType],
  );

  const renderMarqueeItems = useCallback(() => {
    const source = isHoldingsTutorial
      ? dummyHoldingsMarqueeData
      : filteredAndSortedTokens;

    return source?.map((item, index) => {
      const remainingSol = item.balance * item.price.price_sol;
      const prevCalc = item.soldSol + item.balance * item.price.price_sol;
      const pnlSol = prevCalc - item.investedSol;
      const pnlPercentage = (pnlSol / item.investedSol) * 100;

      return (
        <MarqueeItem
          key={item.token.mint + index}
          remainingSol={remainingSol}
          image={item.token.image}
          mint={item.token.mint}
          percentage={pnlPercentage}
          tokenSymbol={item.token.symbol}
        />
      );
    });
  }, [filteredAndSortedTokens, isHoldingsTutorial]);

  if (pathname === "/") return;

  return (
    <div
      // ref={holdingsContainer}
      className="relative flex h-10 w-full items-center justify-center border-b border-border py-3 pl-4"
    >
      <div className="relative mr-2 h-[24px] w-[9rem] rounded-[8px] border border-border p-[1.5px]">
        <div className={cn("flex h-full w-full rounded-[6px] bg-white/[8%]")}>
          <button
            type="button"
            onClick={() => setSortType("amount")}
            className={cn(
              "w-full cursor-pointer rounded-[6px] font-geistMonoSemiBold text-[10px] leading-3 text-fontColorPrimary duration-300 hover:text-[#cccce1] lg:text-xs",
              sortType === "amount"
                ? "bg-white/[8%] text-fontColorPrimary"
                : "",
            )}
          >
            Amount
          </button>
          <button
            type="button"
            onClick={() => setSortType("recent")}
            className={cn(
              "w-full cursor-pointer rounded-[6px] font-geistMonoSemiBold text-[10px] leading-3 text-fontColorPrimary duration-300 hover:text-[#cccce1] lg:text-xs",
              sortType === "recent"
                ? "bg-white/[8%] text-fontColorPrimary"
                : "",
            )}
          >
            Recent
          </button>
        </div>
      </div>
      <div className="relative flex h-full w-full items-center justify-start overflow-hidden pr-4">
        {renderMarqueeItems()}
      </div>
      <span className="absolute right-0 top-0 block h-full w-[10%] bg-gradient-to-r from-black/0 to-black"></span>

      <QuickClipboard withSeparator />
    </div>
  );
}
