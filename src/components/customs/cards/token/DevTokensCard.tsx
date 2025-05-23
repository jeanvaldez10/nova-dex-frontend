"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useCallback, useMemo } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import Copy from "@/components/customs/Copy";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import ScientificNumber from "@/components/customs/ScientificNumber";
import { truncateAddress } from "@/utils/truncateAddress";
import { formatAmount, formatAmountDollar } from "@/utils/formatAmount";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import { formatTimeAgo } from "@/utils/formatDate";
// ######## Types 🗨️ ########
import { DeveloperToken } from "@/types/ws-general";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupStore } from "@/stores/use-popup-state";

interface DevTokensCardProps {
  tokenData: DeveloperToken;
}

export default function DevTokensCard({ tokenData }: DevTokensCardProps) {
  const width = useWindowSizeStore((state) => state.width);
  const isXlDown = width ? width < 1280 : false;
  const { remainingScreenWidth } = usePopupStore();

  const DesktopView = useCallback(
    () => (
      <div className="flex w-full items-center pl-4">
        {/* Token Info Column */}
        <div className="w-full min-w-[180px] min-[1500px]:min-w-[205px]">
          <div className="flex items-center gap-x-4">
            <AvatarWithBadges
              src={tokenData.image}
              alt={`${tokenData.name} Image`}
              size="lg"
            />
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center gap-x-1">
                <Link
                  href={`/token/${tokenData.mint}`}
                  prefetch
                  className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
                >
                  {truncateString(tokenData.name, 8)}
                </Link>
                <span className="text-nowrap text-xs text-fontColorSecondary">
                  {truncateString(tokenData.symbol, 5)}
                </span>
              </div>

              <div className="-mt-0.5 flex items-center gap-x-1">
                <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                  {truncateAddress(tokenData.mint)}
                </span>
                <Copy value={tokenData.mint} dataDetail={tokenData} />
              </div>
            </div>
          </div>
        </div>

        {/* Created Time Column */}
        <div className="h-full w-full min-w-[98px] items-center min-[1500px]:min-w-[115px]">
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/created-clock.png"
                alt="Created Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              {formatTimeAgo(tokenData.created)}
            </span>
          </div>
        </div>

        {/* Migration Status Column */}
        <div className="h-full w-full min-w-[98px] items-center min-[1500px]:min-w-[115px]">
          <span
            className={cn(
              "inline-block text-nowrap font-geistSemiBold text-sm",
              tokenData.migrated ? "text-success" : "text-destructive",
            )}
          >
            {tokenData.migrated ? "True" : "False"}
          </span>
        </div>

        <div className="hidden h-full w-full min-w-[98px] flex-col items-start justify-center xl:flex min-[1500px]:min-w-[115px]">
          <span className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {formatAmountDollar(tokenData.liquidityUsd)}
          </span>
        </div>

        <div className="hidden h-full w-full min-w-[98px] flex-col items-start justify-center xl:flex min-[1500px]:min-w-[115px]">
          <span className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {formatAmountDollar(tokenData.marketCapUsd)}
          </span>
        </div>
      </div>
    ),
    [tokenData, formatTimeAgo],
  );

  const MobileView = useCallback(
    () => (
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="relative flex h-[40px] w-full items-center justify-between bg-white/[4%] px-3 py-3">
          <div className="flex items-center gap-x-2">
            <AvatarWithBadges
              src={tokenData.image}
              alt={`${tokenData.name} Image`}
              size="sm"
            />
            <div className="items-left flex flex-col justify-start gap-x-1">
              <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {tokenData.name}
              </h4>
            </div>
            <div className="flex items-center gap-x-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                {truncateAddress(tokenData.mint)}
              </span>
              <Copy value={tokenData.mint} />
            </div>
          </div>

          <div className="flex h-full items-center gap-x-2">
            <div className="flex items-center gap-x-1">
              <span className="text-xs text-fontColorSecondary">
                {formatTimeAgo(tokenData.created)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 p-3">
          {[
            {
              label: "Liquidity",
              value: formatAmount(tokenData.liquiditySol, 2),
            },
            {
              label: "MC",
              value: formatAmount(tokenData.marketCapSol, 2),
            },
            {
              label: "Migrated",
              value: tokenData.migrated ? "True" : "False",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-y-1">
              <span className="text-nowrap text-xs text-fontColorSecondary">
                {item.label}
              </span>
              <span
                className={cn(
                  "font-geistSemiBold text-xs text-fontColorPrimary",
                  item.value === "True" && "text-success",
                  item.value === "False" && "text-destructive",
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    [tokenData, formatTimeAgo],
  );

  // Memoize the views
  const MemoizedDesktopView = useMemo(() => <DesktopView />, [DesktopView]);
  const MemoizedMobileView = useMemo(() => <MobileView />, [MobileView]);

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "max-xl:rounded-[8px] max-xl:border max-xl:border-border max-xl:bg-card xl:border-none xl:odd:bg-white/[4%]",
        "transition-colors duration-200 ease-out xl:flex xl:h-[72px] xl:min-w-max xl:border-b xl:border-border xl:pr-[16px] xl:hover:bg-white/[8%]",
        remainingScreenWidth <= 1280 && "max-xl:rounded-none max-xl:border-none max-xl:bg-transparent xl:flex xl:h-auto xl:min-w-fit",
      )}
    >
      {isXlDown || remainingScreenWidth < 1280 ? MemoizedMobileView : MemoizedDesktopView}
    </div>
  );
}
