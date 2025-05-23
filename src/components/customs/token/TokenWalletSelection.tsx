"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useParams } from "next/navigation";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
// ######## Components 🧩 ########
import PnLScreenshot from "@/components/customs/token/PnL/PnLScreenshot";
import PnLTrigger from "./PnL/PnLTrigger";
// ######## Utils & Helpers 🤝 ########
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";
import { Wallet } from "@/apis/rest/wallet-manager";
// ######## Types 🗨️ ########

import { CachedImage } from "../CachedImage";
import { usePopupStore } from "@/stores/use-popup-state";

const TokenWalletSelection = ({}: { initWallets?: Wallet[] | null }) => {
  const params = useParams();
  const mintAddress =
    params?.["mint-address"] || (params?.["pool-address"] as string);
  const tokenInformation = useTokenMessageStore(
    (state) => state.tokenInfoMessage,
  );
  const isLoadingHolding = useTokenHoldingStore((state) => state.isLoading);

  const initialTokenPriceSol = useTokenMessageStore(
    (state) => state.priceMessage.price_sol,
  );
  // const initialToken = useTokenMessageStore(
  //   (state) => state.priceMessage,
  // );
  const currentGlobalChartPrice = useCurrentTokenChartPriceStore(
    (state) => state.price,
  );
  const finalPrice =
    (currentGlobalChartPrice === "" || !currentGlobalChartPrice) &&
    !isNaN(Number(initialTokenPriceSol))
      ? initialTokenPriceSol
      : currentGlobalChartPrice;

  useEffect(() => {
    if (finalPrice === 0) {
      Sentry.captureMessage(
        `TokenWalletSelection: finalPrice is 0 for mint ${mintAddress} with currentGlobalChartPrice: ${currentGlobalChartPrice} and initialTokenPriceSol: ${initialTokenPriceSol}, it used ${currentGlobalChartPrice === "" || isNaN(Number(initialTokenPriceSol)) || !currentGlobalChartPrice ? "initialTokenPriceSol" : "currentGlobalChartPrice"}`,
        "error",
      );
    }
  }, [finalPrice, currentGlobalChartPrice, initialTokenPriceSol]);

  const solPrice = useSolPriceMessageStore((state) => state.messages).price;

  // Get token data from store
  const holdingsMessages = useTokenHoldingStore((state) => state.messages);

  // const finalHoldings = useMemo(() => {
  //   // console.log("FINAL HOLDINGS ✨", holdingsMessages);
  //
  //   return holdingsMessages.length
  //     ? holdingsMessages
  //     : ([] as HoldingsConvertedMessageType[]);
  // }, [holdingsMessages]);

  // Calculate totals directly
  const calculateTotalInvested = () => {
    let total = 0;
    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        total += holdToken.investedSol;
      }
    });
    return String(total);
  };

  const calculateTotalBalance = () => {
    let total = 0;
    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        total += holdToken.balance;
      }
    });
    return String(total);
  };

  const calculateTotalRemaining = () => {
    let total = 0;
    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        total += holdToken.balance * Number(finalPrice);
      }
    });
    return String(total);
  };

  const calculateTotalSold = () => {
    let total = 0;
    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        total += holdToken.soldSol;
      }
    });
    return String(total);
  };

  const calculateProfitAndLoss = () => {
    let total = 0;
    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        const prevCalc =
          holdToken?.soldSol + holdToken?.balance * Number(finalPrice);
        const pnlSol = prevCalc - holdToken?.investedSol;
        total += pnlSol ?? 0;
      }
    });
    return String(total);
  };

  const calculateProfitAndLossPercentage = () => {
    let totalPnl = 0;
    let totalInvested = 0;

    holdingsMessages?.forEach((message) => {
      const holdToken = message?.tokens?.find(
        (token) => token.token.mint === mintAddress,
      );
      if (holdToken) {
        const prevCalc =
          holdToken?.soldSol + holdToken?.balance * Number(finalPrice);
        const pnlSol = prevCalc - holdToken?.investedSol;
        totalPnl += pnlSol ?? 0;
        totalInvested += holdToken?.investedSol ?? 0;
        // console.log("🔥PNL DEBUG ~ FOREACH", {
        //   holdToken,
        //   prevCalc,
        //   pnlSol,
        //   totalPnl,
        //   message: message?.tokens?.find(
        //     (token) => token.token.mint === mintAddress,
        //   ),
        // });
      }
    });

    // console.log("🔥PNL DEBUG ~ RESULT", {
    //   totalPnl,
    //   totalInvested,
    //   finalPrice,
    //   PnL: String((totalPnl / totalInvested) * 100),
    // });
    return totalInvested ? String((totalPnl / totalInvested) * 100) : "0";
  };
  // console.log("🔥PNL DEBUG ~ MESSAGES & PRICE", {
  //   messages: holdingsMessages,
  //   finalPrice,
  //   use:
  //     (currentGlobalChartPrice === "" || !currentGlobalChartPrice) &&
  //     !isNaN(Number(initialTokenPriceSol))
  //       ? "initialTokenPriceSol"
  //       : "currentGlobalChartPrice",
  //   currentGlobalChartPrice,
  //   initialTokenPriceSol,
  //   // initialToken,
  // });

  const totalInvested = calculateTotalInvested();
  const totalRemaining = calculateTotalRemaining();
  const totalSold = calculateTotalSold();
  const profitAndLoss = calculateProfitAndLoss();
  const profitAndLossPercentage = calculateProfitAndLossPercentage();

  useEffect(() => {
    if (
      Number(totalInvested) > 0 &&
      Number(totalSold) === 0 &&
      Number(totalRemaining) === 0
    ) {
      Sentry.captureMessage(
        `TokenWalletSelection: totalInvested is greater than 0, but totalSold and totalRemaining are both 0 for mint ${mintAddress}, with totalInvested: ${totalInvested}, totalSold: ${totalSold}, totalRemaining: ${totalRemaining}, finalPrice: ${finalPrice}, and balance: ${calculateTotalBalance()}`,
        "error",
      );
    }
    console.log(holdingsMessages);
  }, [totalInvested, totalRemaining, totalSold]);

  const { popups } = usePopupStore();
  const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

  return (
    <>
      {isSnapOpen ? (
        <div className="nova-scroller w-full overflow-x-auto">
          <div className="flex flex-row items-center gap-x-1 rounded-[8px] border-border bg-[#12121A] max-md:border md:mb-0 md:h-[50px] md:rounded-none md:border-b md:bg-transparent">
            <div className="flex h-full w-full flex-grow flex-col-reverse items-center gap-2 gap-x-0 border-border p-[12px] md:flex-row md:border-l md:p-1">
              <div className="grid w-full flex-grow grid-cols-3 gap-x-2.5 px-1 py-1 pr-2 md:flex-grow md:p-2 md:pl-0.5">
                <div className="relative col-span-1 flex flex-col justify-center gap-1 border-r border-border">
                  <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                    Invested
                  </span>
                  <div className="relative mt-[-0.2rem] flex items-center gap-x-1.5">
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {isLoadingHolding
                        ? "-"
                        : formatAmountWithoutLeadingZero(Number(totalInvested))}
                    </span>
                  </div>
                </div>
                <div className="relative col-span-1 flex flex-col justify-center gap-1 border-r border-border">
                  <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                    Remaining
                  </span>
                  <div className="relative mt-[-0.3rem] flex items-center gap-x-1.5 leading-3">
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {isLoadingHolding
                        ? "-"
                        : formatAmountWithoutLeadingZero(
                            Number(totalRemaining),
                          )}
                    </span>
                  </div>
                </div>
                <div className="relative col-span-1 flex flex-col justify-center gap-1 border-border md:border-r">
                  <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                    Sold
                  </span>
                  <div className="relative mt-[-0.2rem] flex items-center gap-x-1.5">
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {isLoadingHolding
                        ? "-"
                        : formatAmountWithoutLeadingZero(Number(totalSold))}
                    </span>
                  </div>
                </div>
              </div>
              {isLoadingHolding ? (
                <PnLTrigger
                  isLoadingHolding={true}
                  profitAndLoss={"0"}
                  profitAndLossPercentage={"0"}
                />
              ) : (
                <PnLScreenshot
                  title={"$" + tokenInformation?.symbol}
                  solPrice={solPrice}
                  profitAndLoss={profitAndLoss}
                  profitAndLossPercentage={profitAndLossPercentage}
                  invested={totalInvested}
                  sold={totalSold}
                  image={tokenInformation?.image}
                  remaining={totalRemaining}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-x-1 rounded-[8px] border-border bg-[#12121A] max-md:border md:mb-0 md:rounded-none md:border-b md:bg-transparent xl:h-[50px] xl:flex-row">
          <div className="flex w-full items-center justify-between gap-x-2 xl:w-auto xl:pr-0">
            <div className="hidden w-full md:flex xl:hidden">
              {isLoadingHolding ? (
                <PnLTrigger
                  isLoadingHolding={true}
                  profitAndLoss={"0"}
                  profitAndLossPercentage={"0"}
                />
              ) : (
                <PnLScreenshot
                  title={"$" + tokenInformation?.symbol}
                  solPrice={solPrice}
                  profitAndLoss={profitAndLoss}
                  profitAndLossPercentage={profitAndLossPercentage}
                  invested={totalInvested}
                  sold={totalSold}
                  image={tokenInformation?.image}
                  remaining={totalRemaining}
                />
              )}
            </div>
          </div>

          <div className="flex h-full w-full flex-grow flex-col-reverse items-center gap-2 gap-x-0 p-[12px] md:p-1 xl:flex-row">
            <div className="grid w-full flex-grow grid-cols-3 gap-x-2.5 px-1 py-1 pr-2 md:flex-grow md:p-2 md:pl-0.5">
              <div className="relative col-span-1 flex flex-col justify-center gap-1 border-r border-border">
                <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                  Invested
                </span>
                <div className="relative mt-[-0.2rem] flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {isLoadingHolding
                      ? "-"
                      : formatAmountWithoutLeadingZero(Number(totalInvested))}
                  </span>
                </div>
              </div>
              <div className="relative col-span-1 flex flex-col justify-center gap-1 border-r border-border">
                <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                  Remaining
                </span>
                <div className="relative mt-[-0.3rem] flex items-center gap-x-1.5 leading-3">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {isLoadingHolding
                      ? "-"
                      : formatAmountWithoutLeadingZero(Number(totalRemaining))}
                  </span>
                </div>
              </div>
              <div className="relative col-span-1 flex flex-col justify-center gap-1 border-border xl:border-r">
                <span className="relative inline-block text-[10px] leading-3 text-fontColorSecondary">
                  Sold
                </span>
                <div className="relative mt-[-0.2rem] flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {isLoadingHolding
                      ? "-"
                      : formatAmountWithoutLeadingZero(Number(totalSold))}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full md:hidden xl:flex xl:w-auto">
              {isLoadingHolding ? (
                <PnLTrigger
                  isLoadingHolding={true}
                  profitAndLoss={"0"}
                  profitAndLossPercentage={"0"}
                />
              ) : (
                <PnLScreenshot
                  title={"$" + tokenInformation?.symbol}
                  solPrice={solPrice}
                  profitAndLoss={profitAndLoss}
                  profitAndLossPercentage={profitAndLossPercentage}
                  invested={totalInvested}
                  sold={totalSold}
                  image={tokenInformation?.image}
                  remaining={totalRemaining}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(TokenWalletSelection);
