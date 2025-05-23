"use client";
// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
// ######## Components 🧩 ########
import TokenTradingChart from "@/components/customs/token/TokenTradingChart";
const TokenTabs = dynamic(() => import("@/components/customs/token/TokenTabs"));
// ######## Types 🗨️ ########
import { TokenDataMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { NovaChart } from "@/types/nova_tv.types";
import dynamic from "next/dynamic";

const LeftTokenSection = React.memo(
  ({
    initChartData,
    initCandles,
  }: {
    initChartData: TokenDataMessageType | null;
    initCandles?: NovaChart;
  }) => {
    const { popups, remainingScreenWidth } = usePopupStore();
    const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

    return (
      <div
        className={cn(
          "flex h-full flex-grow flex-col flex-wrap items-start gap-4 md:w-[40%] md:gap-2 lg:w-[70%] xl:w-[80%]",
          isSnapOpen && "min-w-0 basis-0 xl:w-[50%]",
          remainingScreenWidth &&
            remainingScreenWidth <= 768 &&
            "md:w-full md:gap-4 lg:w-full xl:w-full",
        )}
      >
        <TokenTradingChart
          initChartData={initChartData}
          initCandles={initCandles}
        />

        <TokenTabs initChartData={initChartData} />
      </div>
    );
  },
);
LeftTokenSection.displayName = "LeftTokenSection";

export default LeftTokenSection;
