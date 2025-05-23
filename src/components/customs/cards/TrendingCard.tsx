"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCallback, useMemo } from "react";
import { useRouter } from "nextjs-toploader/app";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import Copy from "@/components/customs/Copy";
// ######## Utils & Helpers 🤝 ########
import truncateCA from "@/utils/truncateCA";
import { formatTimeAgo } from "@/utils/formatDate";
import { cn } from "@/libraries/utils";
import {
  formatAmount,
  formatAmountDollar,
  formatCommaWithDecimal,
} from "@/utils/formatAmount";
import { truncateString } from "@/utils/truncateString";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchTokenData } from "@/utils/prefetch";
import { prefetchChart } from "@/apis/rest/charts";

interface TrendingCardProps {
  index: number;
  isFirst: boolean;
  tokenData: TrendingDataMessageType;
}

export default function TrendingCard({
  index,
  isFirst,
  tokenData,
}: TrendingCardProps) {
  const router = useRouter();

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
    if (!tokenData?.mint) return "#";

    const params = new URLSearchParams({
      symbol: tokenData?.symbol || "",
      name: tokenData?.name || "",
      image: tokenData?.image || "",
      dex: tokenData?.dex || "",
    });

    return `/token/${tokenData.mint}?${params.toString()}`;
  }, [tokenData?.symbol, tokenData?.name, tokenData?.image, tokenData?.dex]);

  const queryClient = useQueryClient();
  let hoverTimeout: NodeJS.Timeout;
  return (
    <div
      onClick={() => {
        router.push(tokenUrl);
        prefetchChart(queryClient, tokenData.mint);
        // setTimeout(() => {
        //   prefetchCandles(data.mint);
        // }, 10);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(tokenUrl, "_blank");
      }}
      className={cn(
        "transition-color relative flex h-[95px] min-w-max cursor-pointer items-center pl-4 pr-4 duration-200 ease-out hover:bg-shadeTableHover",
        index % 2 === 0 ? "bg-transparent" : "bg-shadeTable",
      )}
    >
      <div className="flex w-full min-w-[196px]">
        <div className="flex items-center gap-x-4">
          <AvatarWithBadges
            classNameParent="border-1 relative flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:h-[56px] lg:w-[56px]"
            symbol={tokenData.symbol}
            src={tokenData.image}
            alt={`${tokenData.name} Image`}
            rightType={
              tokenData.dex
                ?.replace(/\./g, "")
                ?.replace(/ /g, "_")
                ?.toLowerCase() as BadgeType
            }
            handleGoogleLensSearch={(e) =>
              handleGoogleLensSearch(e, tokenData.image)
            }
            rightClassName="size-4"
            size="md"
          />
          <div className="flex flex-col gap-y-0.5">
            <div className="flex items-center gap-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {truncateString(tokenData.symbol, 8)}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent className="-mb-1 bg-[#202035] px-2 py-1 shadow-[0_4px_16px_#000000]">
                    <p className="text-sm text-fontColorPrimary">
                      {tokenData.name}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-nowrap text-xs lowercase leading-3 text-fontColorSecondary">
                {truncateString(tokenData.name, 6)}
              </span>
            </div>

            <div className="-mt-0.5 flex items-center gap-x-1">
              <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                {truncateCA(tokenData.mint, 10)}
              </span>
              <Copy value={tokenData.mint} dataDetail={tokenData} />
            </div>

            <div className="flex w-[96px] flex-nowrap items-center gap-1 overflow-x-scroll">
              {tokenData?.twitter && (
                <SocialLinkButton
                  href={tokenData?.twitter}
                  icon="x"
                  label="Twitter"
                  typeImage="svg"
                />
              )}
              {tokenData?.telegram && (
                <SocialLinkButton
                  href={tokenData?.telegram}
                  icon="telegram"
                  label="Telegram"
                  typeImage="svg"
                />
              )}
              {tokenData?.website && (
                <SocialLinkButton
                  href={tokenData?.website}
                  icon="web"
                  label="Website"
                  typeImage="svg"
                />
              )}
              {tokenData?.youtube && (
                <SocialLinkButton
                  href={tokenData?.youtube ?? ""}
                  icon="youtube"
                  label="YouTube"
                  typeImage="svg"
                />
              )}
              {tokenData?.instagram && (
                <SocialLinkButton
                  href={tokenData?.instagram ?? ""}
                  icon="instagram"
                  label="Instagram"
                  typeImage="svg"
                />
              )}
              {tokenData?.tiktok && (
                <SocialLinkButton
                  href={tokenData?.tiktok ?? ""}
                  icon="tiktok"
                  label="TikTok"
                  typeImage="svg"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[90px] items-center">
        <div className="flex items-center gap-x-1">
          <div className="relative aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src="/icons/created-clock.png"
              alt="Created Clock Icon"
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
      <div className="flex h-full w-full min-w-[80px] items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              {formatAmount(tokenData.liquidity_sol, 2)}
            </span>
          </div>
          <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
            {formatAmountDollar(tokenData.liquidity_usd)}
          </span>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[80px] items-center">
        <div className="flex flex-col">
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {formatAmountDollar(tokenData.market_cap_usd)}
          </span>
          <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
            {formatAmountDollar(tokenData.market_cap_sol)}
          </span>
        </div>
      </div>
      <div className="flex h-full w-full min-w-[72px] items-center">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {formatAmountDollar(tokenData.volume_usd)}
        </span>
      </div>
      <div className="flex h-full w-full min-w-[75px] items-center">
        <div className="flex flex-col">
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {formatAmount(tokenData.buys + tokenData.sells, 2)}
          </span>
          <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
            <span className="text-success">
              {formatAmount(tokenData.buys, 2)}
            </span>
            <span>/</span>{" "}
            <span className="text-destructive">
              {formatAmount(tokenData.sells, 2)}
            </span>
          </span>
        </div>
      </div>

      {["1m", "5m", "30m", "1h"].map((period) => (
        <div
          key={period}
          className="flex h-full w-full min-w-[70px] items-center"
        >
          <span
            className={cn(
              "inline-block text-nowrap font-geistSemiBold text-sm",
              tokenData[
                period as keyof Pick<
                  TrendingDataMessageType,
                  "1m" | "5m" | "30m" | "1h"
                >
              ] >= 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {formatCommaWithDecimal(
              tokenData[
                period as keyof Pick<
                  TrendingDataMessageType,
                  "1m" | "5m" | "30m" | "1h"
                >
              ],
            )}
            %
          </span>
        </div>
      ))}
      <div className="flex h-full w-full min-w-[170px] items-center gap-x-2">
        <AuditResult
          isChecked={tokenData.mint_disabled}
          auditMetric="MAD"
          tooltipMessage="Mint Auth Disabled"
        />
        <AuditResult
          isChecked={tokenData.freeze_disabled}
          auditMetric="FAD"
          tooltipMessage="Freeze Auth Disabled"
        />
        <AuditResult
          isChecked={tokenData.burned}
          auditMetric="LPB"
          tooltipMessage="LP Burned"
        />
        <AuditResult
          isChecked={tokenData.top10 <= 15 ? true : false}
          auditMetric="T10"
          tooltipMessage="Top 10 Holders"
        />
        <AuditResult
          isChecked={tokenData.bundled}
          auditMetric="BT"
          tooltipMessage="Bundled Token"
        />
      </div>
      <div className="mr-auto flex h-full w-full min-w-[90px] items-center justify-end">
        <div
          id={isFirst ? "trending-quick-buy-button-first" : undefined}
          className="h-auto w-auto"
        >
          <QuickBuyButton mintAddress={tokenData.mint} variant="trending" />
        </div>
      </div>
    </div>
  );
}

const AuditResult = ({
  isChecked,
  auditMetric,
  tooltipMessage,
}: {
  isChecked: boolean;
  auditMetric: string;
  tooltipMessage: string;
}) => {
  const imageURL = isChecked
    ? "/icons/audit-checked.png"
    : "/icons/audit-unchecked.png";
  const textColor = isChecked ? "#8CD9B6" : "#F65B93";

  return (
    <div className="flex w-auto flex-shrink-0 flex-col items-center gap-y-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative aspect-auto h-5 w-5 flex-shrink-0">
              <Image
                src={imageURL}
                alt="Audit Status Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent className="mb-1.5">
            <p className="text-xs text-fontColorPrimary">{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span
        style={{ color: textColor }}
        className="inline-block text-wrap font-geistSemiBold text-xs"
      >
        {auditMetric}
      </span>
    </div>
  );
};
