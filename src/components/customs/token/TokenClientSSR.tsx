"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCharts } from "@/hooks/use-charts";
import { useParams } from "next/navigation";
import { useCandles } from "@/hooks/use-trading-view-data";
import { usePopupStore } from "@/stores/use-popup-state";
import dynamic from "next/dynamic";
import cookies from "js-cookie";
// ######## Components 🧩 ########
import LeftTokenSection from "@/components/customs/sections/LeftTokenSection";
import RightTokenSection from "@/components/customs/sections/RightTokenSection";
const TokenSSRConfig = dynamic(
  () => import("@/components/customs/token/TokenSSRConfig"),
);
import { TokenDataMessageType } from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Constants ☑️ ########
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";

export default function TokenClientSSR() {
  const mint = useParams()?.["mint-address"] as string;
  const { data, isFetched } = useCharts({
    mintAddress: mint,
  });

  // 👇 Add a state to hold interval and currency
  const [chartParams, setChartParams] = useState({
    interval: "1m",
    currency: "sol" as "sol" | "usd",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const interval =
        (localStorage.getItem("chart_interval_resolution") as string) || "1m";
      const currency = (
        (localStorage.getItem("chart_currency") as string) || "SOL"
      ).toLowerCase() as "sol" | "usd";
      setChartParams({ interval, currency });
    }
  }, []);

  const { data: candlesData } = useCandles({
    params: {
      mint: mint,
      interval: chartParams.interval,
      currency: chartParams.currency,
      initial: true,
    },
  });

  const initChartData = useMemo(() => {
    return data as TokenDataMessageType;
  }, [data]);

  const { popups, remainingScreenWidth } = usePopupStore();
  const isSnapOpen = useMemo(() => {
    return popups.some((p) => p.isOpen && p.snappedSide !== "none");
  }, [popups]);

  const setBaseTVState = () => {
    console.warn("TV BASE STATE DEBUG ✨");

    if (
      !localStorage.getItem("tradingview.chartproperties") ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties",
        JSON.stringify(defaultTVChartProperties),
      );
    }
    if (
      !localStorage.getItem(
        "tradingview.chartproperties.mainSeriesProperties",
      ) ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties.mainSeriesProperties",
        JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
      );
    }
  };

  useEffect(() => {
    if (
      !cookies.get("_chart_interval_resolution") ||
      cookies.get("_chart_interval_resolution") === "USD" ||
      cookies.get("_chart_interval_resolution") === "SOL"
    ) {
      cookies.set("_chart_interval_resolution", "1S");
    }
    if (!localStorage.getItem("chart_currency")) {
      localStorage.setItem("chart_currency", "USD");
      cookies.set("_chart_currency", "USD");
    }
    if (!localStorage.getItem("chart_type")) {
      localStorage.setItem("chart_type", "MCap");
    }
    if (!localStorage.getItem("chart_hide_buy_avg_price_line")) {
      localStorage.setItem("chart_hide_buy_avg_price_line", "false");
    }
    if (!localStorage.getItem("chart_hide_sell_avg_price_line")) {
      localStorage.setItem("chart_hide_sell_avg_price_line", "false");
    }

    setBaseTVState();

    let themeSetCount = 0;
    const themeSetInterval = setInterval(() => {
      if (themeSetCount < 10) {
        themeSetCount++;
        setBaseTVState();
      } else {
        clearInterval(themeSetInterval);
      }
    }, 500);

    return () => {
      if (themeSetInterval) {
        clearInterval(themeSetInterval);
      }
    };
  }, []);

  return (
    <>
      <TokenSSRConfig initChartData={initChartData} isFetched={isFetched} />
      <div
        className={cn(
          "relative mb-14 mt-4 flex w-full flex-col-reverse gap-x-2 gap-y-4 pb-4 md:mb-12 md:mt-2 md:flex-row md:gap-y-0 md:px-4 xl:mt-0 xl:flex-grow",
          isSnapOpen && "xl:flex-nowrap",
          remainingScreenWidth &&
            remainingScreenWidth < 768 &&
            "md:mb-14 md:mt-4 md:flex-col-reverse md:gap-y-4 md:px-0",
        )}
      >
        <LeftTokenSection
          initChartData={initChartData}
          initCandles={candlesData}
        />
        <RightTokenSection initChartData={initChartData} />
      </div>
    </>
  );
}
