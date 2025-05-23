"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { usePathname } from "next/navigation";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import Copy from "@/components/customs/Copy";
import Separator from "@/components/customs/Separator";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
import SellBuyBadge from "@/components/customs/SellBuyBadge";
import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
// ######## Utils & Helpers 🤝 ########
import { truncateAddress } from "@/utils/truncateAddress";
import { cn } from "@/libraries/utils";
import {
  formatAmount,
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
  formatPrice,
} from "@/utils/formatAmount";
import { truncateString } from "@/utils/truncateString";
// ######## Types 🗨️ ########
import { WalletTracker } from "@/apis/rest/wallet-tracker";
import TimeDifference from "../TimeDifference";
import { useRouter } from "next/navigation";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { CachedImage } from "../../CachedImage";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { SolUsdc } from "@/stores/token/use-token-cards-filter.store";
import { useWalletTrackerFilterStore } from "@/stores/dex-setting/use-wallet-tracker-filter.store";
import { prefetchCandles, prefetchChart } from "@/apis/rest/charts";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  index: number;
  isFirst: boolean;
  tracker: WalletTracker;
  type: "buy" | "sell";
  responsiveBreakpoint: 1280 | 768;
  variant?: "normal" | "pop-out";
  amountType?: SolUsdc;
}

export default React.memo(function WalletTrackerCardPopOut({
  index,
  isFirst,
  tracker,
  type,
  responsiveBreakpoint,
  variant = "normal",
}: Props) {
  const amountType = useWalletTrackerFilterStore((state) => state.amountType);
  const width = useWindowSizeStore((state) => state.width);
  const trackedWallets = useWalletTrackerStore((state) => state.trackedWallets);
  const trackedWalletAdditionalInfo = trackedWallets.find(
    (tw) => tw.address === tracker.walletAddress,
  );

  const solPrice = useSolPriceMessageStore((state) => state.messages.price);

  const handleGoogleLensSearch = useCallback(
    (event: React.MouseEvent, imageUrl: string) => {
      event.stopPropagation();
      window.open(
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
        "_blank",
      );
    },
    [],
  );

  const tokenUrl = useMemo(() => {
    if (!tracker?.mint) return "#";

    const params = new URLSearchParams({
      symbol: tracker?.symbol || "",
      name: tracker?.name || "",
      image: tracker?.image || "",
      dex: tracker?.dex || "",
    });

    return `/token/${tracker.mint}?${params.toString()}`;
  }, [tracker?.symbol, tracker?.name, tracker?.image, tracker?.dex]);

  const router = useRouter();
  const { popups } = usePopupStore();
  const walletTracker = popups.find(
    (value) => value.name === "wallet_tracker",
  )!;
  const { size, mode } = walletTracker;
  const popUpResponsive = size.width < 1000 && mode !== "footer";
  const actionResponsive = size.width < 600 && mode !== "footer";

  const quickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const quickBuyLength = quickBuyAmount.toString().length;
  const dynamicChWidth = 120 + quickBuyLength * 5;
  const [isHover, setIsHover] = useState<boolean>(false);
  const globalSolPrice = useSolPriceMessageStore(
    (state) => state.messages.price,
  );

  const [isNew, setIsNewTrade] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  useEffect(() => {
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - tracker.timestamp);
    const isWithinOneSec = timeDiff <= 1000;

    setIsNewTrade(isWithinOneSec);

    if (isWithinOneSec) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setIsNewTrade(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [tracker.timestamp]);
  const queryClient = useQueryClient();
  return (
    <div
      onClick={() => {
        router.push(tokenUrl);
        prefetchChart(queryClient, tracker.mint);
        prefetchCandles(queryClient, {
          mint: tracker.mint,
          interval: localStorage.getItem("chart_interval_resolution") || "1S",
          currency: (
            (localStorage.getItem("chart_currency") as string) || "SOL"
          ).toLowerCase() as "sol" | "usd",
          initial: true,
        });
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(tokenUrl, "_blank");
      }}
      className={cn("relative pb-2 xl:pb-0")}
    >
      <div
        style={{
          animation: showAnimation
            ? "walletTrackerGlowAndFade 2s ease-in-out forwards"
            : "none",
          display: isNew ? "block" : "none",
        }}
        className="absolute left-0 top-0 z-10 h-full w-full bg-[linear-gradient(150deg,#8b3da180,45%,#e278ff,55%,#8b3da180)] bg-[size:200%_100%]"
      ></div>
      <div className="absolute left-0 top-0 z-10 h-full w-full px-[1px] pb-[1px] pt-[2px]">
        <div
          className={cn(
            "h-full w-full",
            index % 2 === 0 ? "bg-[#080811]" : "bg-shadeTable",
          )}
        ></div>
      </div>

      <div
        className={cn(
          "relative z-10 flex-shrink-0 items-center overflow-hidden from-background to-background-1",
          responsiveBreakpoint === 1280
            ? "border-border max-xl:rounded-[8px] max-xl:bg-card"
            : "border-border max-md:rounded-[8px] max-md:bg-card",
          responsiveBreakpoint === 1280
            ? "transition-color border duration-300 ease-out xl:flex xl:min-w-max xl:border-0 xl:pl-4 xl:pr-2 xl:hover:bg-shadeTableHover"
            : "transition-color border duration-300 ease-out md:flex md:min-w-max md:border-0 md:pl-4 md:pr-2 md:hover:bg-shadeTableHover",
          index % 2 === 0
            ? ""
            : responsiveBreakpoint === 1280
              ? "xl:bg-shadeTable"
              : "md:bg-shadeTable",
        )}
      >
        {/* DESKTOP */}
        {width! >= responsiveBreakpoint && variant !== "pop-out" && (
          <div
            className={cn(
              responsiveBreakpoint === 1280
                ? "hidden h-[80px] w-full min-w-max items-center py-2 xl:flex"
                : "hidden h-[80px] w-full min-w-max items-center py-2 md:flex",
            )}
          >
            <div className="flex h-full w-full min-w-[200px] items-start">
              <div className="flex items-center gap-x-3.5">
                <div className="flex flex-col items-center gap-y-0.5">
                  <AvatarWithBadges
                    classNameParent="border-1 relative flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:size-[48px]"
                    src={tracker.image}
                    alt={`${tracker.name} Image`}
                    rightType={
                      tracker.dex
                        ?.replace(/\./g, "")
                        ?.replace(/ /g, "_")
                        ?.toLowerCase() as BadgeType
                    }
                    handleGoogleLensSearch={(e) =>
                      handleGoogleLensSearch(e, tracker.image)
                    }
                    size="lg"
                    rightClassName="size-[16px]"
                    leftClassName="size-[16px]"
                  />
                  <TimeDifference created={tracker?.timestamp} />
                </div>

                <div className="flex flex-col items-start gap-y-0.5">
                  <div className="flex items-center gap-x-1">
                    <Link
                      href={tokenUrl}
                      prefetch
                      className="cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
                    >
                      {truncateString(tracker.symbol, 6)}
                    </Link>
                    <span className="text-nowrap text-xs lowercase leading-3 text-fontColorSecondary">
                      {truncateString(tracker.name, 5)}
                    </span>
                  </div>

                  <div className="-mt-0.5 flex items-center gap-x-1">
                    <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                      {truncateAddress(tracker.mint)}
                    </span>
                    <Copy value={tracker.mint} dataDetail={tracker} />
                  </div>

                  <div className="flex items-center gap-x-1">
                    {tracker?.twitter && (
                      <SocialLinkButton
                        href={tracker?.twitter}
                        icon="x"
                        label="Twitter"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                    {tracker?.telegram && (
                      <SocialLinkButton
                        href={tracker?.telegram}
                        icon="telegram"
                        label="Telegram"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                    {tracker?.website && (
                      <SocialLinkButton
                        href={tracker?.website}
                        icon="web"
                        label="Website"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-full w-full min-w-[55px] max-w-[75px] items-center">
              <SellBuyBadge type={type} />
            </div>
            <div className="flex h-full w-full min-w-[95px] items-center">
              <div className="flex w-fit flex-col justify-center">
                <div className="flex items-center gap-x-1">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src={
                        amountType === "USDC"
                          ? "/icons/usdc-colored.svg"
                          : "/icons/solana-sq.svg"
                      }
                      alt="Amount Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-xs",
                      type === "sell" ? "text-destructive" : "text-success",
                    )}
                  >
                    {amountType === "USDC"
                      ? formatPrice(
                          Number(
                            formatAmountWithoutLeadingZero(
                              Number(tracker.solAmount) * globalSolPrice,
                            ),
                          ),
                        )
                      : formatAmountWithoutLeadingZero(
                          Number(tracker.solAmount),
                        )}
                  </span>
                </div>
                <div className="flex items-center gap-x-1">
                  <span
                    className={cn(
                      "inline-block text-nowrap text-xs text-fontColorSecondary",
                      type === "sell" ? "text-destructive" : "text-success",
                    )}
                  >
                    {formatAmount(tracker.tokenAmount, 2)} /{" "}
                    {tracker.transactions} txn
                  </span>
                </div>
              </div>
            </div>
            <div className="flex h-full w-full min-w-[105px] items-center">
              <div className="flex w-fit flex-col justify-center">
                <div className="flex items-center gap-x-1">
                  <span
                    className={cn(
                      "inline-block text-nowrap text-xs text-fontColorPrimary",
                      type === "sell" ? "text-destructive" : "text-success",
                    )}
                  >
                    {formatAmountDollar(Number(tracker.marketCap) * solPrice)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex h-full w-full min-w-[80px] items-center">
              <div className="flex flex-col">
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {formatAmount(tracker.buys + tracker.sells, 2)}
                </span>
                <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                  <span className="text-success">
                    {formatAmount(tracker.buys, 2)}
                  </span>
                  <span>/</span>{" "}
                  <span className="text-destructive">
                    {formatAmount(tracker.sells, 2)}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex h-full w-full min-w-[120px] items-center">
              {/* <Popover>
          <PopoverTrigger> */}
              <AddressWithEmojis
                address={truncateString(
                  trackedWalletAdditionalInfo?.name || "",
                  14,
                )}
                fullAddress={trackedWalletAdditionalInfo?.address}
                className="!font-geistRegular text-sm"
                emojis={[]}
                trackedWalletIcon={trackedWalletAdditionalInfo?.emoji}
                buy={tracker.type === "buy" ? true : false}
                stripClassname="!-bottom-0.5"
                isWithLink
              />
            </div>
            <div
              className={cn(
                responsiveBreakpoint === 1280
                  ? "hidden h-full w-full min-w-[180px] flex-col items-start justify-center gap-y-1 xl:flex"
                  : "hidden h-full w-full min-w-[180px] flex-col items-start justify-center gap-y-1 md:flex",
              )}
            >
              <div className="flex items-center gap-x-0.5">
                <div className="flex items-center gap-x-1">
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    {formatAmountWithoutLeadingZero(
                      Number(tracker?.balanceNow),
                    )}
                  </span>
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    of
                  </span>
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    {formatAmountWithoutLeadingZero(
                      Number(tracker?.balanceTotal),
                    )}
                  </span>
                </div>
                <span className="flex h-[16px] items-center justify-center text-nowrap rounded-full px-1 py-0.5 font-geistRegular text-xs text-fontColorSecondary">
                  {tracker?.balancePercentage}
                </span>
              </div>

              <GradientProgressBar
                bondingCurveProgress={Number(
                  tracker?.balancePercentage.split("%")[0],
                )}
                className="h-[4px] max-w-[170px]"
              />
            </div>
            <div className="flex h-full w-full min-w-[90px] max-w-[90px] items-center justify-start">
              <div
                id={
                  isFirst ? "wallet-tracker-quick-buy-button-first" : undefined
                }
                className="flex items-center gap-x-2"
              >
                <QuickBuyButton
                  mintAddress={tracker.mint}
                  variant="footer-wallet-tracker"
                />
              </div>
            </div>
          </div>
        )}

        {variant === "pop-out" && (
          <div
            className={cn(
              responsiveBreakpoint === 1280
                ? "relative hidden h-[80px] w-full min-w-max items-center py-2 xl:flex"
                : "relative hidden h-[80px] w-full min-w-max items-center py-2 md:flex",
            )}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {/* avatar */}
            <div
              className={cn(
                "flex h-full w-full items-center",
                popUpResponsive ? "min-w-[200px]" : "min-w-[340px]",
                size.width < 500 && "min-w-[150px]",
              )}
              style={{
                minWidth: `${size.width / 3 + 5}px`,
              }}
            >
              <div className="flex items-center gap-x-3.5">
                <div className="flex items-center gap-5">
                  <TimeDifference created={tracker?.timestamp} hoursOnly />
                  <AvatarWithBadges
                    classNameParent={cn(
                      "border-1 relative flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:size-[48px]",
                      popUpResponsive && "lg:size-[32px]",
                    )}
                    src={tracker.image}
                    alt={`${tracker.name} Image`}
                    rightType={
                      tracker.dex
                        ?.replace(/\./g, "")
                        ?.replace(/ /g, "_")
                        ?.toLowerCase() as BadgeType
                    }
                    handleGoogleLensSearch={(e) =>
                      handleGoogleLensSearch(e, tracker.image)
                    }
                    size="lg"
                    rightClassName="size-[16px]"
                    leftClassName="size-[16px]"
                  />
                </div>

                <div className="flex items-center gap-x-2">
                  <div className="flex items-center gap-x-2">
                    <Link
                      href={tokenUrl}
                      prefetch
                      className="cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
                    >
                      {truncateString(
                        tracker.symbol,
                        5 + Math.floor((size.width - 420) / 20),
                      )}
                    </Link>

                    {!popUpResponsive && (
                      <span className="text-nowrap text-xs lowercase leading-3 text-fontColorSecondary">
                        {truncateString(tracker.name, 7)}
                      </span>
                    )}
                  </div>

                  {size.width > 800 && (
                    <div className="-mt-0.5 flex items-center gap-x-1">
                      <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                        {truncateAddress(tracker.mint)}
                      </span>
                      <Copy value={tracker.mint} dataDetail={tracker} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* address */}
            <div className="flex h-full w-full min-w-[100px] max-w-[200px] items-center">
              <AddressWithEmojis
                address={truncateString(
                  trackedWalletAdditionalInfo?.name || "",
                  popUpResponsive ? 8 : 14,
                )}
                fullAddress={trackedWalletAdditionalInfo?.address}
                className="!font-geistRegular text-sm"
                trackedWalletIcon={trackedWalletAdditionalInfo?.emoji}
                buy={tracker.type === "buy" ? true : false}
                stripClassname="!-bottom-0.5"
                isWithLink
                emojis={[]}
              />
            </div>

            {/* amount */}
            <div className="flex h-full w-full min-w-[85px] items-center">
              <div className="flex items-center">
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <CachedImage
                    src={
                      amountType === "USDC"
                        ? "/icons/usdc-colored.svg"
                        : "/icons/solana-sq.svg"
                    }
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs",
                    type === "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  {amountType === "USDC"
                    ? formatPrice(
                        Number(
                          formatAmountWithoutLeadingZero(
                            Number(tracker.solAmount) * globalSolPrice,
                          )
                            .replace("K", "000")
                            .replace("M", "000000")
                            .replace("B", "000000000"),
                        ),
                      )
                    : formatAmountWithoutLeadingZero(Number(tracker.solAmount))}
                </span>
              </div>
            </div>

            {/* market cap */}
            <div className="flex h-full w-full min-w-[65px] max-w-[200px] flex-col justify-center">
              <span
                className={cn(
                  "inline-block text-nowrap text-xs text-fontColorPrimary",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                {formatAmountDollar(Number(tracker.marketCap) * solPrice)}
              </span>
            </div>

            {/* Action */}
            <div
              className={cn(
                "flex h-full w-full min-w-[120px] max-w-[120px] items-center justify-start",
                quickBuyLength > 1
                  ? `min-w-[${dynamicChWidth}ch] max-w-[${dynamicChWidth}ch]`
                  : "min-w-[120px] max-w-[120px]",
                actionResponsive &&
                  "absolute right-2 top-0 min-w-0 max-w-0 justify-end",
                !isHover && actionResponsive && "hidden",
              )}
            >
              <div
                id={
                  isFirst ? "wallet-tracker-quick-buy-button-first" : undefined
                }
                className="flex items-center gap-x-2"
              >
                <QuickBuyButton
                  mintAddress={tracker.mint}
                  variant="footer-wallet-tracker"
                  className="hover:bg-shadeTableHover"
                />
              </div>
            </div>
          </div>
        )}

        {/* MOBILE */}
        {width! < responsiveBreakpoint && (
          <div
            className={cn(
              responsiveBreakpoint === 1280
                ? "flex w-full flex-col xl:hidden"
                : "flex w-full flex-col md:hidden",
            )}
          >
            {/* Header */}
            <div className="relative flex h-8 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
              <div className="relative z-20 flex items-center gap-x-2">
                <AvatarWithBadges
                  classNameParent="border-1 relative flex aspect-square flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg"
                  src={tracker.image}
                  alt={`${tracker.name} Image`}
                  rightType={
                    tracker.dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={(e) =>
                    handleGoogleLensSearch(e, tracker.image)
                  }
                  size="xs"
                />

                <div className="flex items-center gap-x-1">
                  <Link
                    href={tokenUrl}
                    prefetch
                    className="cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
                  >
                    {truncateString(tracker.symbol, 6)}
                  </Link>
                  <span className="text-nowrap text-xs lowercase leading-3 text-fontColorSecondary">
                    {truncateString(tracker.name, 8)}
                  </span>
                </div>

                <Copy value={tracker.mint} />
              </div>

              <div className="relative z-20 flex items-center gap-x-2">
                {/* <span className="relative z-20 text-nowrap text-[10px] text-fontColorSecondary">
              {timeDifference}
            </span> */}
                <TimeDifference
                  created={tracker?.timestamp}
                  className="text-fontColorSecondary"
                />

                {(tracker.twitter || tracker.telegram || tracker.website) && (
                  <Separator
                    color="#202037"
                    orientation="vertical"
                    unit="fixed"
                    fixedHeight={18}
                  />
                )}

                {(tracker.twitter || tracker.telegram || tracker.website) && (
                  <div className="flex items-center gap-x-1">
                    {tracker.twitter && (
                      <SocialLinkButton
                        href={tracker.twitter}
                        icon="x"
                        label="Twitter"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                    {tracker.telegram && (
                      <SocialLinkButton
                        href={tracker.telegram}
                        icon="telegram"
                        label="Telegram"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                    {tracker.website && (
                      <SocialLinkButton
                        href={tracker.website}
                        icon="web"
                        label="Website"
                        typeImage="svg"
                        size="sm"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative flex w-full flex-col">
              <div className="flex w-full items-start justify-between px-2 py-3">
                {/* Type */}
                <div className="flex flex-col gap-y-0.5">
                  <span className="whitespace-nowrap text-xs text-fontColorSecondary">
                    Type
                  </span>
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-xs",
                      type === "sell" ? "text-destructive" : "text-success",
                    )}
                  >
                    {type[0].toUpperCase() + type.slice(1)}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-y-0.5">
                  <span className="text-xs text-fontColorSecondary">
                    Amount
                  </span>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1 text-xs text-fontColorPrimary">
                      <div className="relative -mt-[1px] aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src={
                            amountType === "USDC"
                              ? "/icons/usdc-colored.svg"
                              : "/icons/solana-sq.svg"
                          }
                          alt="Solana SQ Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                      <span
                        className={cn(
                          "inline-block text-nowrap font-geistSemiBold text-xs",
                          type === "sell" ? "text-destructive" : "text-success",
                        )}
                      >
                        {amountType === "USDC"
                          ? formatPrice(
                              Number(
                                formatAmountWithoutLeadingZero(
                                  Number(tracker.solAmount) * globalSolPrice,
                                ),
                              ),
                            )
                          : formatAmountWithoutLeadingZero(
                              Number(tracker.solAmount),
                            )}
                      </span>
                    </span>
                    <div className="flex items-center gap-x-1">
                      <span
                        className={cn(
                          "inline-block text-nowrap text-xs text-fontColorSecondary",
                          type === "sell" ? "text-destructive" : "text-success",
                        )}
                      >
                        {formatAmount(tracker.tokenAmount, 2)}/
                        {tracker.transactions} txn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Cap */}
                <div className="flex flex-col gap-y-0.5">
                  <span className="whitespace-nowrap text-xs text-fontColorSecondary">
                    Market cap
                  </span>
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-xs",
                      type === "sell" ? "text-destructive" : "text-success",
                    )}
                  >
                    {formatAmountDollar(Number(tracker.marketCap) * solPrice)}
                  </span>
                </div>

                {/* TXNS */}
                <div className="flex flex-col gap-y-0.5">
                  <span className="text-xs text-fontColorSecondary">TXNS</span>
                  <div className="flex flex-col">
                    <span className="inline-block text-nowrap text-xs text-fontColorPrimary md:font-geistSemiBold">
                      {formatAmount(tracker.buys + tracker.sells, 2)}
                    </span>
                    <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                      <span className="text-success">
                        {formatAmount(tracker.buys, 2)}
                      </span>
                      <span>/</span>
                      <span className="text-destructive">
                        {formatAmount(tracker.sells, 2)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Wallet */}
                <div className="flex flex-col gap-y-0.5">
                  <span className="text-xs text-fontColorSecondary">
                    Wallet Name
                  </span>

                  <AddressWithEmojis
                    address={truncateString(
                      trackedWalletAdditionalInfo?.name || "",
                      12,
                    )}
                    fullAddress={trackedWalletAdditionalInfo?.address}
                    className="!font-geistRegular text-sm"
                    emojis={[]}
                    trackedWalletIcon={trackedWalletAdditionalInfo?.emoji}
                    buy={tracker.type === "buy" ? true : false}
                    stripClassname="!-bottom-0.5"
                    isWithLink
                  />
                </div>
              </div>

              <Separator color="#202037" />

              {/* BC & Actions */}
              <div className="flex h-[42px] w-full items-center justify-between p-2">
                <div className="flex h-full w-full max-w-[200px] flex-col items-start justify-center gap-y-1">
                  <div className="flex items-center gap-x-1">
                    <div className="flex items-center gap-x-1">
                      <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                        {formatAmountWithoutLeadingZero(
                          Number(tracker?.balanceNow),
                        )}
                      </span>
                      <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                        of
                      </span>
                      <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                        {formatAmountWithoutLeadingZero(
                          Number(tracker?.balanceTotal),
                        )}
                      </span>
                    </div>
                    <span className="flex h-[16px] items-center justify-center text-nowrap rounded-full bg-white/[8%] px-1 py-0.5 font-geistRegular text-xs text-fontColorSecondary">
                      {tracker?.balancePercentage}
                    </span>
                  </div>

                  <GradientProgressBar
                    bondingCurveProgress={Number(
                      tracker?.balancePercentage.split("%")[0],
                    )}
                    className="h-[4px]"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <div
                    id={
                      isFirst
                        ? "wallet-tracker-quick-buy-button-first"
                        : undefined
                    }
                  >
                    <QuickBuyButton
                      mintAddress={tracker.mint}
                      variant="footer-wallet-tracker"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
