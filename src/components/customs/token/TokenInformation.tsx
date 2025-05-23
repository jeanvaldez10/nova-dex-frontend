"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useParams, useSearchParams } from "next/navigation";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import Copy from "@/components/customs/Copy";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import { CachedImage } from "../CachedImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import TokenImageHover from "../TokenImageHover";
// ######## Utils & Helpers 🤝 ########
import { BadgeType } from "@/components/customs/AvatarWithBadges";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { PriceInfo, TokenInfo } from "@/types/ws-general";
import truncateCA from "@/utils/truncateCA";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import axios from "@/libraries/axios";
import {
  fetchAdditionalTokenData,
  TokenSecurityData,
} from "@/apis/rest/tokens";
import { useQuery } from "@tanstack/react-query";
import { handleGoogleLensSearch } from "@/utils/handleGoogleLensSearch";
import Link from "next/link";
import { TokenInformationSetting } from "@/apis/rest/settings/settings";
import { cn } from "@/libraries/utils";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";

export default React.memo(function TokenInformation({
  initTokenInfo,
  initPrice,
}: {
  initTokenInfo: TokenInfo | null;
  initPrice: PriceInfo | null;
}) {
  const searchParams = useSearchParams();
  const params = useParams();

  const tokenMint = (params?.["mint-address"] as string) || "";
  const tokenSymbol = searchParams?.get("symbol") || "";
  const tokenName = searchParams?.get("name") || "";
  const tokenDex = searchParams?.get("dex") || "";
  const tokenImage = searchParams?.get("image") || "";
  const tokenTwitter = searchParams?.get("twitter") || "";
  const tokenTelegram = searchParams?.get("telegram") || "";
  const tokenWebsite = searchParams?.get("website") || "";
  const tokenInstagram = searchParams?.get("instagram") || "";
  const tokenYoutube = searchParams?.get("youtube") || "";
  const tokenTiktok = searchParams?.get("tiktok") || "";
  const tokenMcap = searchParams?.get("market_cap_usd") || "";
  const tokenLiquidity = searchParams?.get("liquidity_usd") || "";
  const tokenProgress = Number(searchParams?.get("progress")) || 0;

  const tokenData = useTokenMessageStore((state) => state.tokenInfoMessage);
  const priceMessage = useTokenMessageStore((state) => state.priceMessage);

  const {
    presets: customizedSettingPresets,
    activePreset: customizedSettingActivePreset,
  } = useCustomizeSettingsStore();

  const currentTokenInformationPreset =
    customizedSettingPresets[customizedSettingActivePreset]
      .tokenInformationSetting || "normal";

  const finalTokenInfo = useMemo(
    () => (tokenData.name ? tokenData : initTokenInfo),
    [tokenData, initTokenInfo],
  );

  const finalPrice = useMemo(
    () => (priceMessage.market_cap_usd ? priceMessage : initPrice),
    [priceMessage, initPrice],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (finalTokenInfo?.mint && finalPrice?.market_cap_usd && tokenSymbol) {
      const paramsToRemove = [
        "symbol",
        "name",
        "image",
        "twitter",
        "telegram",
        "website",
        "market_cap_usd",
        "liquidity_usd",
        "progress",
      ];

      console.log("SP 💘 - TOKEN INFO PARAMS ", {
        tokenMint,
        tokenSymbol,
        tokenDex,
      });

      const url = new URL(window.location.href);
      paramsToRemove.forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, "", url);
    }
  }, [finalTokenInfo?.mint, finalPrice?.market_cap_usd]);

  const { data: additionalTokenData, isLoading: isFetchingAdditionalData } =
    useQuery<TokenSecurityData>({
      queryKey: ["token-security", tokenMint],
      queryFn: () => fetchAdditionalTokenData(tokenMint, tokenData?.pair),
      enabled: Boolean(
        tokenMint &&
          tokenData?.pair &&
          (finalTokenInfo?.dex
            ? finalTokenInfo.dex !== "Pump.Fun"
            : tokenDex !== "Pump.Fun"),
      ),
    });

  return (
    <div className="w-full rounded-[8px] border border-border bg-[#080811]">
      <div className="flex w-full flex-col gap-y-3 px-[12px] py-[10px] md:p-4">
        <div className="flex h-auto w-full items-center justify-between">
          <div className="flex items-center gap-x-3">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger>
                <AvatarWithBadges
                  src={finalTokenInfo?.image || tokenImage}
                  alt="Token Detail Image"
                  leftType={
                    finalTokenInfo?.dex !== finalTokenInfo?.origin_dex
                      ? (finalTokenInfo?.origin_dex
                          ?.replace(/\./g, "")
                          ?.replace(/ /g, "_")
                          ?.toLowerCase() as BadgeType)
                      : undefined
                  }
                  rightType={
                    finalTokenInfo?.dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  size="md"
                />
                <HoverCardContent
                  align="end"
                  alignOffset={-120}
                  side="top"
                  sideOffset={-40}
                  className="relative h-40 w-40 overflow-hidden rounded-[8px] border-none"
                >
                  <TokenImageHover
                    src={finalTokenInfo?.image || tokenImage}
                    handleGoogleLensSearch={
                      finalTokenInfo?.image
                        ? (e) =>
                            handleGoogleLensSearch(e, finalTokenInfo.image!)
                        : undefined
                    }
                  />
                </HoverCardContent>
              </HoverCardTrigger>
            </HoverCard>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-1.5">
                <h3 className="text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                  {finalTokenInfo?.symbol || tokenSymbol}
                </h3>
                <div className="-mt-0.5 flex items-center gap-x-0.5">
                  <Copy
                    value={finalTokenInfo?.mint || ""}
                    className="size-[18px]"
                    classNameChild="size-[18px]"
                    dataDetail={finalTokenInfo ?? undefined}
                  />
                  <Link
                    href={`https://x.com/search?q=${finalTokenInfo?.mint}`}
                    target="_blank"
                    className="relative aspect-square h-[18px] w-[18px] flex-shrink-0 duration-300 hover:brightness-200"
                  >
                    <Image
                      src="/icons/search.svg"
                      alt="Search Icon"
                      fill
                      quality={50}
                      unoptimized
                      className="object-contain"
                    />
                  </Link>
                </div>
              </div>
              <span className="inline-block text-nowrap text-xs text-[#9191A4]">
                {finalTokenInfo?.name || tokenName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 p-2">
            {finalTokenInfo?.twitter && (
              <SocialLinkButton
                href={finalTokenInfo?.twitter || tokenTwitter}
                icon="x"
                label="Twitter"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.origin_dex === "Pump.Fun" ||
              (finalTokenInfo?.dex === "Pump.Swap" && (
                <SocialLinkButton
                  href={`https://pump.fun/${finalTokenInfo?.mint}`}
                  icon="pumpfun-gray"
                  label="Pumpfun"
                  typeImage="svg"
                />
              ))}
            {finalTokenInfo?.telegram && (
              <SocialLinkButton
                href={finalTokenInfo?.telegram || tokenTelegram}
                icon="telegram"
                label="Telegram"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.website && (
              <SocialLinkButton
                href={finalTokenInfo?.website || tokenWebsite}
                icon="web"
                label="Website"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.youtube && (
              <SocialLinkButton
                href={finalTokenInfo?.youtube || tokenYoutube}
                icon="youtube"
                label="YouTube"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.instagram && (
              <SocialLinkButton
                href={finalTokenInfo?.instagram || tokenInstagram}
                icon="instagram"
                label="Instagram"
                typeImage="svg"
              />
            )}
            {finalTokenInfo?.tiktok && (
              <SocialLinkButton
                href={finalTokenInfo?.tiktok || tokenTiktok}
                icon="tiktok"
                label="TikTok"
                typeImage="svg"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-1">
              <Link
                href={`https://solscan.io/account/${finalTokenInfo?.mint}`}
                className="cursor-pointer text-xs text-primary duration-300 hover:text-fontColorPrimary"
              >
                Token ({truncateCA(finalTokenInfo?.mint || tokenMint || "", 8)})
              </Link>
              <Copy
                variant="white"
                value={finalTokenInfo?.mint || ""}
                dataDetail={{
                  mint: finalTokenInfo?.mint || "",
                  symbol: finalTokenInfo?.symbol || tokenSymbol,
                  name: finalTokenInfo?.name || tokenName,
                  image: finalTokenInfo?.image || tokenName,
                }}
              />
            </div>
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={16}
            />
            <div className="flex items-center gap-x-1">
              <Link
                href={`https://solscan.io/account/${finalTokenInfo?.pair}`}
                target="_blank"
                className="cursor-pointer text-xs text-primary duration-300 hover:text-fontColorPrimary"
              >
                Pair
              </Link>
              <Copy variant="white" value={finalTokenInfo?.pair || ""} />
            </div>
          </div>

          <div className="w-[100px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative z-20 flex w-full items-center gap-x-[10px]">
                    <GradientProgressBar
                      bondingCurveProgress={finalPrice?.progress || 0}
                    />
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {finalPrice?.progress
                        ? Math.min(finalPrice?.progress, 100).toFixed(0)
                        : Math.min(tokenProgress, 100).toFixed(0)}
                      %
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="!-ml-[50px] rounded-[4px] bg-[#202037]"
                >
                  <span className="inline-block text-nowrap text-xs">
                    Bonding Curve Progress
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="relative flex h-auto w-full flex-col gap-y-[10px] rounded-[8px] bg-gradient-to-b from-[#131320] via-[#0B0B14] to-[#131320] px-[16px] py-[10px]">
        <div className="grid h-[40px] grid-cols-3 gap-x-2">
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Market Cap"
          >
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {formatAmountDollar(
                  finalPrice?.market_cap_usd || tokenMcap || 0,
                )}
              </span>
            </div>
          </TokenInformationColumn>
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Price in"
          >
            <div className="flex items-center gap-x-0.5">
              {currentTokenInformationPreset === "normal" && (
                <div className="relative -mt-0.5 aspect-auto h-[17px] w-[17px] flex-shrink-0">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={50}
                    unoptimized
                    className="object-contain"
                  />
                </div>
              )}
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {Number(finalPrice?.price_sol) === 0 || !finalPrice?.price_sol
                  ? "N/A"
                  : formatAmountWithoutLeadingZero(
                      Number(finalPrice?.price_sol),
                      4,
                    )}
              </span>
            </div>
          </TokenInformationColumn>
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Price in USD"
          >
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {Number(finalPrice?.price_usd_str) === 0 ||
                !finalPrice?.price_usd_str
                  ? "N/A"
                  : formatAmountWithoutLeadingZero(
                      Number(finalPrice?.price_usd_str),
                      4,
                    )}
              </span>
            </div>
          </TokenInformationColumn>
        </div>

        <Separator />

        <div className="grid h-auto grid-cols-3 gap-x-2">
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Liquidity"
            additionalTokenData={additionalTokenData}
            isFetching={isFetchingAdditionalData}
            isGraduated={
              !["Pump.Fun", "Moonshot", "LaunchLab"].includes(
                finalTokenInfo?.dex || tokenDex,
              )
            }
          >
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {finalPrice?.liquidity_usd
                  ? formatAmountDollar(
                      finalPrice?.liquidity_usd || tokenLiquidity || 0,
                    )
                  : "N/A"}
              </span>
              {!isFetchingAdditionalData &&
                currentTokenInformationPreset !== "simplify" &&
                !["Pump.Fun", "Moonshot", "LaunchLab"].includes(
                  finalTokenInfo?.dex || tokenDex,
                ) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src={
                            additionalTokenData?.liquidityLocked
                              ? "/icons/token/lock-blue-icon.svg"
                              : "/icons/token/unlock-red-icon.svg"
                          }
                          alt="Lock Icon"
                          height={12}
                          width={10}
                          className="ml-1"
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="rounded-[4px] bg-[#202037]"
                      >
                        <span className="inline-block text-nowrap text-xs">
                          {additionalTokenData?.liquidityLocked
                            ? "Locked"
                            : "Unlocked"}{" "}
                          Supply
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
          </TokenInformationColumn>
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Supply"
          >
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                {finalPrice?.supply
                  ? finalPrice?.supply > 999000000 &&
                    finalPrice?.supply <= 1000000001
                    ? "1B"
                    : formatAmountDollar(
                        Math.round(finalPrice?.supply),
                      )?.replace("$", "")
                  : 0}
              </span>
            </div>
          </TokenInformationColumn>
          <TokenInformationColumn
            variant={currentTokenInformationPreset}
            context="Dex Paid"
          >
            {isFetchingAdditionalData ? (
              // Skeleton
              <div className="flex h-[16px] w-full animate-pulse items-center justify-center bg-[#202037]"></div>
            ) : (
              <div className="flex items-center gap-x-1">
                <span
                  className={`font-geistSemiBold text-sm ${additionalTokenData?.dexPaid ? "text-success" : "text-destructive"}`}
                >
                  {additionalTokenData?.dexPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            )}
          </TokenInformationColumn>
        </div>
      </div>
    </div>
  );
});

const TokenInformationColumn = ({
  context,
  children,
  variant,
  additionalTokenData,
  isFetching,
  isGraduated,
}: {
  context:
    | "Market Cap"
    | "Price in"
    | "Price in USD"
    | "Liquidity"
    | "Supply"
    | "Dex Paid";
  children: React.ReactNode;
  variant: TokenInformationSetting;
  additionalTokenData?: TokenSecurityData;
  isFetching?: boolean;
  isGraduated?: boolean;
}) => {
  const getSimplifyContext = () => {
    switch (context) {
      case "Market Cap":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/market-cap.svg"
                  alt="Market Cap Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Price in":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/price-in-sol.svg"
                  alt="Price In SOL Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context} SOL
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Price in USD":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/price-in-usd.svg"
                  alt="Price In USD Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Liquidity":
        return isGraduated
          ? !isFetching && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Image
                      src={
                        additionalTokenData?.liquidityLocked
                          ? "/icons/token/lock-blue-icon.svg"
                          : "/icons/token/unlock-red-icon.svg"
                      }
                      alt="Lock Icon"
                      height={14}
                      width={14}
                      className="object-contain"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="rounded-[4px] bg-[#202037]"
                  >
                    <span className="inline-block text-nowrap text-xs">
                      {additionalTokenData?.liquidityLocked
                        ? "Locked"
                        : "Unlocked"}{" "}
                      Supply
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          : null;
      case "Supply":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/supply.svg"
                  alt="Supply Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "Dex Paid":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src="/icons/dex-paid.svg"
                  alt="Dex Paid Icon"
                  height={18}
                  width={18}
                  className="object-contain"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-[4px] bg-[#202037]">
                <span className="inline-block text-nowrap text-xs">
                  {context}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };
  return (
    <div
      className={cn(
        "col-span-1 flex h-full w-full flex-col justify-start gap-y-1",
        variant === "simplify" && "flex-row items-center gap-1",
      )}
    >
      <span className="inline-block text-wrap text-xs text-[#9191A4]">
        {variant === "simplify" ? getSimplifyContext() : context}
      </span>
      {children}
    </div>
  );
};
