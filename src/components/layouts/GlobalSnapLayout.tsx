"use client";

import React, { useMemo } from "react";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
const TwitterPopup = dynamic(() => import("@/components/customs/TwitterPopup"));
const WalletTrackerPopup = dynamic(
  () => import("@/components/customs/WalletTrackerPopup"),
);

const mainLayout: Layout = {
  name: "main",
  component: "",
};

const twitterMonitorLayout: Layout = {
  name: "twitter",
  component: <TwitterPopup key="twitter" />,
};

const walletTrackerLayout: Layout = {
  name: "wallet_tracker",
  component: <WalletTrackerPopup key="wallet_tracker" />,
};

const layout = [mainLayout, twitterMonitorLayout, walletTrackerLayout];

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

interface Layout {
  name: "main" | WindowName;
  component: React.ReactNode;
}

const SCROLLED_PAGES = ["referral", "token"];

export default function GlobalSnapLayout({ children }: Props) {
  const pathname = usePathname();
  const scrollable = useMemo(() => {
    return SCROLLED_PAGES.some((page) => pathname.includes(page));
  }, [pathname]);
  const { popups, currentSnappedPopup, prevSnappedLeft, prevSnappedRight } =
    usePopupStore();

  console.log("SNAP: indexOfMain", {
    currentSnappedPopup,
    prevSnappedLeft,
    prevSnappedRight,
  });

  const sortByPriority = <T extends { name: string }>(
    originalArray: T[],
    priorityArray: string[],
  ): T[] => {
    // Create a Map to store priority indices
    const priorityMap = new Map(
      priorityArray.map((item, index) => [item, index]),
    );

    // Sort the original array by name property
    return [...originalArray].sort((a, b) => {
      const priorityA = priorityMap.has(a.name)
        ? priorityMap.get(a.name)!
        : Infinity;
      const priorityB = priorityMap.has(b.name)
        ? priorityMap.get(b.name)!
        : Infinity;
      return priorityA - priorityB;
    });
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full grow flex-col overflow-hidden xl:flex-row",
        scrollable && "h-[calc(100dvh-88.8px)]",
      )}
    >
      {sortByPriority(layout, currentSnappedPopup.left).map(
        ({ name, component }, i) => {
          const popup = popups.find((p) => p.name === name);
          if (
            currentSnappedPopup.left.includes(name as WindowName) ||
            (prevSnappedLeft === (name as WindowName) &&
              popup?.mode === "popup") ||
            (prevSnappedLeft !== (name as WindowName) &&
              prevSnappedRight !== (name as WindowName) &&
              popup?.mode === "popup")
          )
            return (
              <div
                key={name}
                id={`${name}-popup-side`}
                style={{
                  marginLeft:
                    popup?.snappedSide === "left" && popup?.isOpen
                      ? 16
                      : undefined,

                  marginRight:
                    popup?.snappedSide === "right" && popup?.isOpen
                      ? 16
                      : undefined,
                }}
              >
                {component}
              </div>
            );
        },
      )}
      <div
        id={"main-component"}
        className={cn(
          "flex h-full w-full min-w-0 flex-1 grow flex-col",
          scrollable && "nova-scroller flex-1 overflow-y-auto",
        )}
      >
        {children}
      </div>
      {sortByPriority(layout, currentSnappedPopup.right)
        .reverse()
        .map(({ name, component }, i) => {
          const popup = popups.find((p) => p.name === name);
          if (
            currentSnappedPopup.right.includes(name as WindowName) ||
            (prevSnappedRight === (name as WindowName) &&
              popup?.mode === "popup")
          )
            return (
              <div
                key={name}
                id={`${name}-popup-side`}
                style={{
                  marginLeft:
                    popup?.snappedSide === "left" && popup?.isOpen
                      ? 16
                      : undefined,

                  marginRight:
                    popup?.snappedSide === "right" && popup?.isOpen
                      ? 16
                      : undefined,
                }}
              >
                {component}
              </div>
            );
        })}
    </div>
  );
}
