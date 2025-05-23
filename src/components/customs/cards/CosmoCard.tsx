"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useCallback, useMemo, useRef, memo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePopupStore } from "@/stores/use-popup-state";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import { prefetchCandles, prefetchChart } from "@/apis/rest/charts";
import { hideCosmoToken } from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { CachedImage } from "@/components/customs/CachedImage";

import GradientProgressBar from "@/components/customs/GradientProgressBar";
import CosmoQuickBuyButton from "@/components/customs/buttons/CosmoQuickBuyButton";
import TimeDifference from "@/components/customs/cards/TimeDifference";
import StatBadges from "@/components/customs/cards/partials/StatBadges";
import StatTexts from "@/components/customs/cards/partials/StatTexts";
import SocialLinks from "@/components/customs/cards/partials/SocialLinks";
import SnipeButton from "@/components/customs/buttons/SnipeButton";
import Copy from "@/components/customs/Copy";

// Also import type separately to avoid bundling the component
import type { BadgeType } from "@/components/customs/AvatarWithBadges";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import truncateCA from "@/utils/truncateCA";
// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { handleGoogleLensSearch } from "@/utils/handleGoogleLensSearch";
import { AvatarSetting } from "@/apis/rest/settings/settings";
const CustomToast = React.lazy(() => import("../toasts/CustomToast"));
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import { TokenName } from "./partials/TokenName";

type CosmoCardProps = {
  data: CosmoDataMessageType;
  column: 1 | 2 | 3;
  isFirst?: boolean;
};

const avatarSizeMap = {
  normal: "!size-[48px]",
  large: "!size-[56px]",
  extralarge: "!size-[64px]",
  doubleextralarge: "!size-[72px]",
};

const getAvatarSizeNumber = (preset: keyof typeof avatarSizeMap): number => {
  // Extract number from string like "!size-[48px]"
  const sizeString = avatarSizeMap[preset];
  const match = sizeString.match(/\[(\d+)px\]/);
  return match ? parseInt(match[1], 10) : 48; // Default to 48 if no match
};

const progressWidthMap = {
  normal: "!w-[48px]",
  large: "!w-[56px]",
  extralarge: "!w-[64px]",
  doubleextralarge: "!w-[72px]",
};
const largePresets = ["large", "extralarge", "doubleextralarge"];

const twitterStatusPopoverAlignment = {
  1: "start",
  2: "center",
  3: "end",
};

const setHeight = (type: AvatarSetting) => {
  switch (type) {
    case "doubleextralarge":
      return "142.6px";
    case "extralarge":
      return "134.6px";
    case "large":
      return "126.6px";
    default:
      return "118.6px";
  }
};
const presetPriority: AvatarSetting[] = [
  "doubleextralarge",
  "extralarge",
  "large",
  "normal",
];
const CosmoCard = memo(
  ({ data, column, isFirst }: CosmoCardProps) => {
    const router = useRouter();
    const queryClientNormal = useQueryClient();

    const customizedSettingPresets = useCustomizeSettingsStore(
      (state) => state.presets,
    );
    const customizedSettingActivePreset = useCustomizeSettingsStore(
      (state) => state.activePreset,
    );

    const currentAvatarPreset =
      customizedSettingPresets[customizedSettingActivePreset].avatarSetting ||
      "normal";
    const currentFontPreset =
      customizedSettingPresets[customizedSettingActivePreset].fontSetting ||
      "normal";

    const isSnapOpen = usePopupStore((state) =>
      state.popups.some((p) => p.isOpen && p.snappedSide !== "none"),
    );

    const isXlDown = useWindowSizeStore(
      (state) => state.width! < 1280 || false,
    );

    const hideToken = useHiddenTokensStore((state) => state.hideToken);
    const unhideToken = useHiddenTokensStore((state) => state.unhideToken);
    const isTokenHidden = useHiddenTokensStore((state) =>
      state.isTokenHidden(data.mint),
    );
    const hiddenTokens = useHiddenTokensStore((state) => state.hiddenTokens);
    const tokenUrlRef = useRef<string>("#");

    const combined = [currentAvatarPreset, currentFontPreset];

    const avatarSetting = useMemo(() => {
      return presetPriority.find((p) => combined.includes(p));
    }, [presetPriority, combined]);

    useEffect(() => {
      if (data?.mint) {
        const params = new URLSearchParams({
          symbol: data?.symbol || "",
          name: data?.name || "",
          image: data?.image || "",
          market_cap_usd: String(data?.market_cap_usd || ""),
          liquidity_usd: String(data?.liquidity_usd || ""),
          dex: data?.dex || "",
        });
        tokenUrlRef.current = `/token/${data.mint}?${params.toString()}`;
      }
    }, [
      data?.mint,
      data?.symbol,
      data?.name,
      data?.image,
      data?.market_cap_usd,
      data?.liquidity_usd,
      data?.dex,
    ]);

    const cardStyles = useMemo(
      () => ({
        wrapper: cn(
          "block group w-full flex-shrink-0 cursor-pointer overflow-hidden group",
          data?.migrating
            ? "border border-transparent"
            : "border border-transparent bg-[#080811] duration-300 hover:border-border",
        ),
        header: cn(
          "relative flex h-7 w-full items-center justify-between overflow-hidden px-3",
          data?.migrating ? "bg-transparent" : "bg-white/[6%]",
        ),
        content: cn(
          "flex w-full h-full flex-col items-start gap-y-3 bg-gradient-to-b px-3 py-2",
          data?.migrating
            ? "from-[#26112C] to-[70%] to-transparent"
            : "from-[#1A1A23] to-transparent",
        ),
      }),
      [data?.migrating],
    );

    const remainingScreenWidth = usePopupStore(
      (state) => state.remainingScreenWidth,
    );
    const isSmallScreen =
      largePresets.includes(currentAvatarPreset) ||
      largePresets.includes(currentFontPreset)
        ? remainingScreenWidth < 1300
        : remainingScreenWidth < 1000;

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!data?.mint) return;

        console.time("Navigate from Cosmo:");

        // Only prefetch if not already in cache
        if (!queryClientNormal.getQueryData(["chart", data.mint])) {
          prefetchChart(queryClientNormal, data.mint);
          prefetchCandles(queryClientNormal, {
            mint: data.mint,
            interval: localStorage.getItem("chart_interval_resolution") || "1S",
            currency: (
              (localStorage.getItem("chart_currency") as string) || "SOL"
            ).toLowerCase() as "sol" | "usd",
            initial: true,
          });
        }

        // Prefetch the page route
        router.prefetch(tokenUrlRef.current);
        router.push(tokenUrlRef.current);
      },
      [router, queryClientNormal, data?.mint],
    );

    const handleCardContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(tokenUrlRef.current, "_blank");
    }, []);

    return (
      <div
        className={cn(
          cardStyles.wrapper,
          "group relative transition-[height] duration-300 ease-in-out",
        )}
        style={{ height: setHeight(avatarSetting as AvatarSetting) }}
      >
        {/* Header */}
        <div className={cn(cardStyles.header)}>
          {/* Migrating Mask */}
          {data?.migrating ? (
            <div
              // key="migrating-mask"
              className="absolute left-0 top-0 h-[30px] w-full bg-[#080811]"
            >
              <div className="h-full w-full bg-gradient-to-b from-[#150619] to-[#42254B]"></div>
            </div>
          ) : (
            <div className="absolute left-0 top-0 h-[30px] w-full bg-[#080811]">
              <div className="h-full w-full bg-secondary"></div>
            </div>
          )}

          {/* Card Decoration*/}
          <div
            className="absolute right-0 top-0 aspect-[200/30] h-[30px] flex-shrink-0 bg-[url('/images/decorations/card-decoration.svg')] bg-contain bg-right bg-no-repeat mix-blend-overlay"
            style={{ isolation: "isolate" }}
          />

          <div className="relative flex items-center gap-x-1.5">
            {data?.migrating && (
              <div className="flex w-fit items-center justify-center gap-x-1 font-geistSemiBold text-sm text-primary">
                <Image
                  src="/icons/migrating-loading.svg"
                  alt="Migrating Loading Icon"
                  height={16}
                  width={16}
                  quality={80}
                  className={cn(
                    "relative aspect-square size-[16px] flex-shrink-0 animate-spin",
                  )}
                />
                Migrating...
              </div>
            )}
            <div className="flex items-center gap-x-1.5">
              <button
                title="Hide Token"
                className="relative z-[10] hidden aspect-square size-4 flex-shrink-0 group-hover:block"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (isTokenHidden) {
                      await hideCosmoToken(
                        hiddenTokens.filter(
                          (hiddenToken) => hiddenToken !== data.mint,
                        ),
                      ).then(() => {
                        toast.custom((t: any) => (
                          <CustomToast
                            tVisibleState={t.visible}
                            message="Successfully unhidden token"
                            state="SUCCESS"
                          />
                        ));
                      }); // API call (should be updated to unhide)
                      unhideToken(data.mint); // Store update
                    } else {
                      await hideCosmoToken([...hiddenTokens, data.mint]).then(
                        () => {
                          toast.custom((t: any) => (
                            <CustomToast
                              tVisibleState={t.visible}
                              message="Successfully hidden token"
                              state="SUCCESS"
                            />
                          ));
                        },
                      ); // API call
                      hideToken(data.mint); // Store update
                    }
                  } catch (error) {
                    console.warn("Error toggling token visibility:", error);
                  }
                }}
              >
                <CachedImage
                  src={
                    isTokenHidden
                      ? "/icons/eye-show.svg"
                      : "/icons/eye-hide.svg"
                  }
                  alt={isTokenHidden ? "Show Token Icon" : "Hide Token Icon"}
                  height={16}
                  width={16}
                  quality={100}
                  className="object-contain"
                />
              </button>

              <h4 className="text-nowrap font-geistSemiBold text-sm leading-none text-fontColorPrimary">
                {isSnapOpen
                  ? isXlDown
                    ? truncateCA(data?.symbol || "", 5)
                    : data?.symbol || ""
                  : data?.symbol || ""}
              </h4>

              <TokenName
                isSnapOpen={isSnapOpen}
                migrating={data.migrating}
                name={data.name}
              />
            </div>

            <div className="z-[10] flex items-center gap-x-1">
              <Copy
                value={data?.mint}
                dataDetail={data}
                sizeConstant={16}
                withAnimation={false}
              />
              <Link
                href={`https://x.com/search?q=${data?.mint}`}
                target="_blank"
                title="Search Token"
                className="relative aspect-square h-4 w-4 flex-shrink-0 duration-300 hover:brightness-200"
              >
                <CachedImage
                  src="/icons/search.svg"
                  alt="Search Icon"
                  height={16}
                  width={16}
                  quality={80}
                  className="object-contain"
                />
              </Link>
              <Separator
                color="#202037"
                orientation="vertical"
                unit="fixed"
                fixedHeight={14}
                className="block flex-shrink-0 lg:hidden"
              />
            </div>
          </div>

          {/* Links */}
          <SocialLinks
            dex={data?.dex}
            twitterStatusPopoverAlignment={
              twitterStatusPopoverAlignment[column] as
                | "start"
                | "center"
                | "end"
            }
            isFirst={isFirst!}
            twitter={data?.twitter}
            mint={data?.mint}
            telegram={data?.telegram}
            website={data?.website}
            instagram={data?.instagram}
            tiktok={data?.tiktok}
            youtube={data?.youtube}
          />
        </div>

        {/* Content */}
        <div className={cn(cardStyles.content)}>
          <div
            onClick={handleCardClick}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                handleCardContextMenu(e);
              }
            }}
            onContextMenu={handleCardContextMenu}
            className="absolute left-0 top-0 z-[5] flex size-full items-center justify-center pl-3 pt-6"
          >
            <div
              className={cn(
                "relative flex w-full items-center",
                isSnapOpen &&
                  (["extralarge", "doubleextralarge"].includes(
                    currentAvatarPreset,
                  ) ||
                    ["extralarge", "doubleextralarge"].includes(
                      currentFontPreset,
                    ))
                  ? "items-start gap-x-1 lg:gap-x-3"
                  : "gap-x-4",
              )}
            >
              <div className="flex flex-col items-center gap-y-1.5">
                <AvatarWithBadges
                  classNameParent={`border-1 relative flex aspect-square h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#DF74FF]/30 bg-border/0 backdrop-blur-lg lg:size-[48px] z-[10] ${avatarSizeMap[currentAvatarPreset]}`}
                  symbol={data?.symbol}
                  src={data?.image}
                  alt="Token Image"
                  leftType={
                    data?.dex === "Raydium" ||
                    data?.dex === "Meteora DLMM" ||
                    data?.dex === "Meteora DYN" ||
                    data?.dex === "Pump.Swap"
                      ? (data?.origin_dex
                          ?.replace(/\./g, "")
                          ?.replace(/ /g, "_")
                          ?.toLowerCase() as BadgeType)
                      : undefined
                  }
                  rightType={
                    data?.dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={
                    data?.image
                      ? (e) => handleGoogleLensSearch(e, data.image!)
                      : undefined
                  }
                  badgeSizeConstant={16}
                  sizeConstant={getAvatarSizeNumber(
                    (currentAvatarPreset ||
                      "normal") as keyof typeof avatarSizeMap,
                  )}
                  rightClassName="size-[16px]"
                  leftClassName="size-[16px]"
                  size={
                    ["normal", "large"].includes(currentAvatarPreset)
                      ? "sm"
                      : "lg"
                  }
                />

                <div
                  className={`flex ${progressWidthMap[currentAvatarPreset]} flex-col items-center justify-center`}
                >
                  <GradientProgressBar
                    bondingCurveProgress={Math.round(Number(data?.progress))}
                    variant="linear"
                  />

                  <TimeDifference
                    created={data?.created}
                    migrated_time={data?.migrated_time}
                    dex={data?.dex}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-y-1">
                <StatBadges
                  isMigrating={data?.migrating}
                  stars={data?.stars}
                  snipers={data?.snipers}
                  insiderPercentage={data?.insider_percentage}
                  top10Percentage={data?.top10_percentage}
                  devHoldingPercentage={data?.dev_holding_percentage}
                  isSnapOpen={isSnapOpen}
                  isLargePreset={["large"].includes(currentAvatarPreset)}
                  isXLPreset={["extralarge", "doubleextralarge"].includes(
                    currentAvatarPreset,
                  )}
                />

                <div className="flex flex-col gap-y-[1px]">
                  {!isSnapOpen && (
                    <div className="mb-[2px] mt-[2px] flex items-center gap-x-1.5 font-geistSemiBold text-xs text-fontColorSecondary">
                      Bundled:
                      <span
                        className={cn(
                          "inline-block",
                          data?.bundled ? "text-destructive" : "text-success",
                        )}
                      >
                        {data?.bundled ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                  <StatTexts
                    isSnapOpen={isSnapOpen}
                    mint={data?.mint}
                    bundled={data?.bundled}
                    marketCapUSD={data?.market_cap_usd}
                    volumeUSD={data?.volume_usd}
                    holders={data?.holders}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay */}
          {isSmallScreen && (
            <div className="invisible absolute left-0 top-0 z-[8] h-full w-full bg-gradient-to-r from-[#1A1A2300] to-[#080811]/[85%] to-[90%] opacity-0 transition-all duration-300 ease-in-out group-hover:visible group-hover:opacity-100"></div>
          )}

          {/* CTAs */}
          {data?.migrating ? (
            <SnipeButton
              data={data}
              className={cn(
                "absolute right-[12px] top-1/2 z-[10] flex w-auto flex-shrink-0 -translate-y-1/2 items-center justify-center",
                isSnapOpen && "right-0 scale-[0.9]",
                isSmallScreen &&
                  "opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100",
              )}
            />
          ) : (
            <CosmoQuickBuyButton
              mintAddress={data?.mint}
              className={cn(
                "absolute right-[12px] top-1/2 z-[10] flex w-auto flex-shrink-0 -translate-y-1/2 items-center justify-center",
                isSnapOpen && "right-0 scale-[0.9]",
                isSmallScreen &&
                  "opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100",
              )}
            />
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Ultra-granular comparison for better memoization
    if (
      prevProps.column !== nextProps.column ||
      prevProps.isFirst !== nextProps.isFirst
    ) {
      return false;
    }

    const prevData = prevProps.data;
    const nextData = nextProps.data;

    // Only compare fields that affect rendering
    return (
      prevData.mint === nextData.mint &&
      prevData.last_update === nextData.last_update
    );
  },
);
CosmoCard.displayName = "CosmoCard";
export default CosmoCard;
