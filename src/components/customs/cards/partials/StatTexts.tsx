"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo } from "react";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useCustomCardView } from "@/stores/setting/use-custom-card-view.store";

// ######## Components 🧩 ########
import StatText from "@/components/customs/cards/partials/StatText";
import TokenTrackers from "@/components/customs/cards/partials/TokenTrackers";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { formatAmountDollar } from "@/utils/formatAmount";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";

// mapping text size class
const fontSizeMap = {
  normal: "text-xs",
  large: "text-sm",
  extralarge: "text-base",
  doubleextralarge: "text-lg",
};

const iconSizeMap = {
  normal: "size-4",
  large: "size-5",
  extralarge: "size-6",
  doubleextralarge: "size-7",
};

// mapping value color class
const valueColorMap = {
  normal: "text-fontColorPrimary",
  blue: "text-[#4A89FF]",
  purple: "text-[#DF74FF]",
  fluorescentblue: "text-[#1BF6FD]",
  neutral: "text-white",
  lemon: "text-[#C0FD30]",
};

const StatTexts = React.memo(
  ({
    isSnapOpen,
    mint,
    bundled,
    marketCapUSD,
    volumeUSD,
    holders,
  }: {
    isSnapOpen: boolean;
    mint: string;
    bundled: boolean;
    marketCapUSD: number;
    volumeUSD: number;
    holders: number;
  }) => {
    const cardViewConfig = useCustomCardView((state) => state.cardViewConfig);

    const customizedSettingPresets = useCustomizeSettingsStore((state) => state.presets);
    const customizedSettingActivePreset = useCustomizeSettingsStore((state) => state.activePreset);

    const currentPresets = useMemo(() => ({
      fontSetting: customizedSettingPresets[customizedSettingActivePreset].fontSetting || "normal",
      avatarSetting: customizedSettingPresets[customizedSettingActivePreset].avatarSetting || "normal",
      colorSetting: customizedSettingPresets[customizedSettingActivePreset].colorSetting || "normal"
    }), [customizedSettingPresets, customizedSettingActivePreset]);

    // Function to check if a specific card view is active
    const isCardViewActive = (key: string): boolean => {
      const configItem = cardViewConfig.find((item) => item.key === key);
      return configItem?.status === "active";
    };

    const formattedStats = useMemo(
      () => ({
        marketCap: marketCapUSD ? formatAmountDollar(marketCapUSD) : "0",
        volume: volumeUSD ? formatAmountDollar(volumeUSD) : "0",
      }),
      [marketCapUSD, volumeUSD],
    );

    const marketCapValueColor = useMemo(() => {
      if (!marketCapUSD) return "text-destructive";
      
      if (marketCapUSD > 100000) return "text-success";
      if (marketCapUSD > 30000) return "text-warning";
      if (marketCapUSD > 15000) return "text-[#6ac0ed]";
      return "text-destructive";
    }, [marketCapUSD]);

    const remainingScreenWidth = usePopupStore((state) => state.remainingScreenWidth);
    const isExistTracker = useWalletTrackerMessageStore((state) => state.isExistingTx(mint));
    return (
      <div
        className={cn(
          "flex items-center gap-x-2",
          (["extralarge", "doubleextralarge"].includes(currentPresets.fontSetting) ||
            ["extralarge", "doubleextralarge"].includes(
              currentPresets.avatarSetting,
            ))
            ? "flex-col items-start max-w-min xl:max-w-[240px] xl:flex-row"
            : "flex-row",
          isSnapOpen && "flex-wrap",
          // remainingScreenWidth < 1440 && "flex-row items-start w-[240px]",
          // remainingScreenWidth < 1300 && "flex-row items-start w-[180px]",
          // remainingScreenWidth < 1100 && "w-full",
          remainingScreenWidth < 1440 &&
          ["large", "extralarge", "doubleextralarge"].includes(currentPresets.fontSetting) &&
          "flex-row items-start w-[240px] gap-y-1",
          remainingScreenWidth < 1300 &&
          ["large", "extralarge", "doubleextralarge"].includes(currentPresets.fontSetting) &&
          "flex-row items-start w-[180px] gap-y-1",
        )}
      >
        {/* Bundled stat */}
        {isSnapOpen && isCardViewActive("bundled") && (
          <StatText
            value={bundled ? "Yes" : "No"}
            label="BD"
            tooltipLabel="Bundled"
            valueColor={bundled ? "text-destructive" : "text-success"}
            customClassName={fontSizeMap[currentPresets.fontSetting]}
            customClassIcon={iconSizeMap[currentPresets.fontSetting]}
          />
        )}

        {/* Market Cap stat */}
        {isCardViewActive("market-cap") && (
          <StatText
            value={formattedStats?.marketCap}
            label="MC"
            tooltipLabel="Market Cap"
            valueColor={marketCapValueColor}
            customClassName={fontSizeMap[currentPresets.fontSetting]}
            customClassIcon={iconSizeMap[currentPresets.fontSetting]}
          />
        )}

        {/* Volume stat */}
        {isCardViewActive("volume") && (
          <StatText
            value={formattedStats.volume}
            label="V"
            tooltipLabel="Volume"
            valueColor={valueColorMap[currentPresets.colorSetting]}
            customClassName={fontSizeMap[currentPresets.fontSetting]}
            customClassIcon={iconSizeMap[currentPresets.fontSetting]}
          />
        )}

        {/* Holders stat */}
        {isCardViewActive("holders") && (
          <StatText
            icon="holders"
            value={String(holders) || "0"}
            label="Holders"
            tooltipLabel="Holders"
            valueColor={valueColorMap[currentPresets.colorSetting]}
            customClassName={fontSizeMap[currentPresets.fontSetting]}
            customClassIcon={iconSizeMap[currentPresets.fontSetting]}
          />
        )}

        {isExistTracker && <TokenTrackers mint={mint} valueColor={valueColorMap[currentPresets.colorSetting]} customClassName={fontSizeMap[currentPresets.fontSetting]} customClassIcon={iconSizeMap[currentPresets.avatarSetting]} />}
      </div>
    );
  },
);
StatTexts.displayName = "StatTexts";
export default StatTexts;
