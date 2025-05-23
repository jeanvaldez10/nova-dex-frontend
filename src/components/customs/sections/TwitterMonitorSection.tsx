"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTwitterMonitorModalFullscreenStore } from "@/stores/footer/use-twitter-monitor-modal-fullscreen.store";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Skeleton } from "@/components/ui/skeleton";
import AllVariantTwitterMonitorList, {
  TwitterMonitorListRef,
} from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import TwitterMonitorListSkeleton, {
  TwitterMonitorSkeletonListRef,
} from "@/components/customs/skeletons/TwitterMonitorListSkeleton";
import TwitterMonitorMenuSkeleton from "@/components/customs/skeletons/TwitterMonitorMenuSkeleton";
import TwitterMonitorActionsSkeleton from "@/components/customs/skeletons/TwitterMonitorActionsSkeleton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { TwitterMonitorMessageType } from "@/types/ws-general";
// ######## Constants ☑️ ########
import AddTwitter from "@/components/customs/modals/contents/footer/twitter/AddTwitter";
import ConfigureSniper from "@/components/customs/modals/contents/footer/twitter/ConfigureSniper";
import ManageTwitter from "@/components/customs/modals/contents/footer/twitter/ManageTwitter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSnapStateStore } from "@/stores/use-snap-state";

type MenuLabel =
  | "All Twitter"
  | "Comment Twitter"
  | "Retweet Twitter"
  | "Retweet Twitter"
  | "Post Twitter"
  | "Quote Retweet";

type MenuList = {
  label: MenuLabel;
  description: string;
  icons: {
    active: string;
    inactive: string;
  };
  component: React.ComponentType;
}[];

const Component = () => {
  return <div></div>;
};

const menuList: MenuList = [
  {
    label: "All Twitter",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/x-active.png",
      inactive: "/icons/footer/x-inactive.png",
    },
    component: Component,
  },
  {
    label: "Comment Twitter",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/comment-twitter-active.png",
      inactive: "/icons/footer/comment-twitter-inactive.png",
    },
    component: Component,
  },
  {
    label: "Retweet Twitter",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/retweet-twitter-active.png",
      inactive: "/icons/footer/retweet-twitter-inactive.png",
    },
    component: Component,
  },
  {
    label: "Post Twitter",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/post-twitter-active.png",
      inactive: "/icons/footer/post-twitter-inactive.png",
    },
    component: Component,
  },
  {
    label: "Quote Retweet",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/quote-retweet-active.png",
      inactive: "/icons/footer/quote-retweet-inactive.png",
    },
    component: Component,
  },
];

// ####### Reusable Buttons 🔄 #######
// Configure Sniper 🎯
const ConfigureSniperButton = () => {
  return (
    <>
      <BaseButton
        variant="gray"
        className={cn(
          "h-8 w-full flex-grow pl-2 pr-3",
          // isFullscreen ? "h-10 w-full" : "h-8",
        )}
        prefixIcon={
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/footer/configure-sniper.svg"
              alt="Configure Sniper Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-sm text-fontColorPrimary",
          )}
        >
          Configure Sniper
        </span>
      </BaseButton>
    </>
  );
};
// Add Twitter ✖️
const AddTwitterButton = () => {
  return (
    <>
      <BaseButton
        variant="primary"
        className={cn(
          "h-8 w-full flex-grow pl-4 transition-colors max-xl:w-full",
        )}
        prefixIcon={
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/add.png"
              alt="Add Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-sm text-[#080811]",
          )}
        >
          Add Twitter
        </span>
      </BaseButton>
    </>
  );
};
// Memoized ManageTwitterButton component
const ManageTwitterButton = React.memo(
  ({ isMobile = false }: { isMobile?: boolean }) => {
    if (isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <BaseButton variant="gray" className="size-[32px]">
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/footer/setting-primary.svg"
                    alt="Setting Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </TooltipTrigger>
            <TooltipContent className="z-[1000]">
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <BaseButton
        variant="gray"
        className={cn("h-8 w-full")}
        prefixIcon={
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/footer/setting-primary.svg"
              alt="Gray Setting Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-sm",
          )}
        >
          Manage Twitter
        </span>
      </BaseButton>
    );
  },
);
ManageTwitterButton.displayName = "ManageTwitterButton";

const minMessagesPerGrid = 10;
const distributeMessages = (
  messages: TwitterMonitorMessageType[],
  minPerGrid: number,
) => {
  const totalMessages = messages.length;
  const grids: [
    TwitterMonitorMessageType[],
    TwitterMonitorMessageType[],
    TwitterMonitorMessageType[],
  ] = [[], [], []];

  let currentGrid = 0;

  messages.forEach((message, index) => {
    grids[currentGrid].push(message);

    if (grids[currentGrid].length >= minPerGrid && currentGrid < 2) {
      currentGrid++;
    }
  });

  return grids;
};

// ####### Main Component 🚀 #######
export default function TwitterMonitorSection() {
  const messages = useTwitterMonitorMessageStore((state) => state.messages);
  const isLoading = useTwitterMonitorMessageStore((state) => state.isLoading);

  const desktopListRef = useRef<TwitterMonitorListRef>(null);
  const mobileListRef = useRef<TwitterMonitorListRef>(null);
  const desktopSkeletonRef = useRef<TwitterMonitorSkeletonListRef>(null);
  const mobileSkeletonRef = useRef<TwitterMonitorSkeletonListRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // This effect handles scrolling from the parent container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Try desktop refs first, then fall back to mobile refs
      const listRef = desktopListRef.current || mobileListRef.current;
      const skeletonRef =
        desktopSkeletonRef.current || mobileSkeletonRef.current;

      // Determine which component is currently rendered (list or skeleton)
      const activeRef = isLoading ? skeletonRef : listRef;

      if (!activeRef) return; // Early return if no ref is available

      const scrollInstance = activeRef.getScrollInstance();

      if (scrollInstance) {
        try {
          // Get the viewport element - this is the actual scrollable element
          const viewportElement = scrollInstance.elements()?.viewport;

          if (viewportElement) {
            // Check if the scroll container is in view
            const rect = viewportElement.getBoundingClientRect();
            const isInViewport =
              rect.top <= window.innerHeight &&
              rect.bottom >= 0 &&
              rect.left <= window.innerWidth &&
              rect.right >= 0;

            if (isInViewport) {
              // Prevent default scrolling behavior
              e.preventDefault();

              // Use native scrollBy on the viewport element instead of scroll API
              viewportElement.scrollBy({
                top: e.deltaY,
                behavior: "auto",
              });
            }
          }
        } catch (error) {
          console.warn("Error handling scroll:", error);
        }
      }
    };

    // Add the wheel event listener to the container
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Clean up the event listener
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isLoading]);
  // Menu Configuration ✨
  const [selectedSettingMenu, setSelectedSettingMenu] =
    useState<MenuLabel>("All Twitter");

  // Messages ✉️
  const commentMessages = useMemo(
    () =>
      messages
        .filter(
          (message) => message?.type === "comment" && message?.created_at > 0,
        )
        .sort((a, b) => {
          const timestampA = BigInt(Number(a.created_at) || 0);
          const timestampB = BigInt(Number(b.created_at) || 0);
          return Number(timestampB - timestampA);
        }),
    [messages],
  );

  const retweetMessages = useMemo(
    () =>
      messages
        .filter(
          (message) => message?.type === "retweet" && message?.created_at > 0,
        )
        .sort((a, b) => {
          const timestampA = BigInt(Number(a.created_at) || 0);
          const timestampB = BigInt(Number(b.created_at) || 0);
          return Number(timestampB - timestampA);
        }),
    [messages],
  );

  const postMessages = useMemo(
    () =>
      messages
        .filter(
          (message) => message?.type === "post" && message?.created_at > 0,
        )
        .sort((a, b) => {
          const timestampA = BigInt(Number(a.created_at) || 0);
          const timestampB = BigInt(Number(b.created_at) || 0);
          return Number(timestampB - timestampA);
        }),
    [messages],
  );

  const quoteRetweetMessages = useMemo(
    () =>
      messages
        .filter(
          (message) =>
            message?.type === "quote_retweet" && message?.created_at > 0,
        )
        .sort((a, b) => {
          const timestampA = BigInt(Number(a.created_at) || 0);
          const timestampB = BigInt(Number(b.created_at) || 0);
          return Number(timestampB - timestampA);
        }),
    [messages],
  );

  const finalMessages = useMemo(() => {
    const typeMessagesMap = {
      "All Twitter": messages
        .filter((message) => message?.created_at > 0)
        .sort((a, b) => {
          const timestampA = BigInt(Number(a.created_at) || 0);
          const timestampB = BigInt(Number(b.created_at) || 0);
          return Number(timestampB - timestampA);
        }),
      "Comment Twitter": commentMessages,
      "Retweet Twitter": retweetMessages,
      "Post Twitter": postMessages,
      "Quote Retweet": quoteRetweetMessages,
    };

    return typeMessagesMap[selectedSettingMenu];
  }, [
    selectedSettingMenu,
    messages,
    commentMessages,
    retweetMessages,
    postMessages,
    quoteRetweetMessages,
  ]);

  const currentSnapped = useSnapStateStore((state) => state.currentSnapped);

  return (
    <div
      className={
        "relative mb-11 flex w-full flex-grow flex-col items-center justify-start lg:flex-row lg:justify-center lg:rounded-[8px]"
      }
      ref={containerRef}
    >
      {/* Desktop */}
      <div
        className={cn(
          "absolute left-0 top-0 hidden h-full w-full flex-grow gap-x-4 lg:flex",
          currentSnapped.side !== "none" && "lg:hidden",
        )}
      >
        {/* Twitter Type */}
        <div className="flex h-fit w-full max-w-[220px] flex-shrink-0 flex-grow flex-col items-center justify-between rounded-[8px] border border-border p-2 xl:max-w-[280px]">
          <div className="flex h-fit w-full flex-col items-center gap-y-2">
            {isLoading ? (
              <TwitterMonitorMenuSkeleton variant="desktop" />
            ) : (
              menuList.map((item, i) => {
                const isSelected = item.label === selectedSettingMenu;

                return (
                  <button
                    key={i + item?.label}
                    onClick={() => setSelectedSettingMenu(item?.label)}
                    className={cn(
                      "relative flex h-10 w-full items-center justify-start gap-x-2 rounded-[8px] py-2 pl-2 pr-4 duration-300 xl:pr-2",
                      isSelected ? "bg-primary/[12%]" : "bg-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                        isSelected && "bg-primary",
                      )}
                    ></span>

                    <div className="relative aspect-square size-6 flex-shrink-0">
                      <Image
                        src={
                          isSelected
                            ? item?.icons?.active
                            : item?.icons?.inactive
                        }
                        alt={item?.label + "Icon"}
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>

                    <span
                      className={cn(
                        "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary duration-300",
                        isSelected && "text-[#DF74FF]",
                      )}
                    >
                      {item?.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex h-full w-full flex-col">
          <div className="relative grid w-full flex-grow grid-cols-1">
            {isLoading ? (
              <TwitterMonitorListSkeleton
                variant="small"
                isFullscreen={false}
                count={10}
                ref={desktopSkeletonRef}
              />
            ) : (
              <AllVariantTwitterMonitorList
                list={finalMessages}
                variant="large"
                isFullscreen={false}
                ref={desktopListRef}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex h-fit w-full max-w-[240px] flex-shrink-0 flex-grow flex-col items-center justify-between rounded-[8px] border border-border p-2 xl:max-w-[280px]">
          <div className="mt-auto flex w-full flex-col items-center justify-center gap-y-2">
            {isLoading ? (
              <TwitterMonitorActionsSkeleton variant="desktop" />
            ) : (
              <>
                <AddTwitter trigger={<AddTwitterButton />} />
                {/* <ConfigureSniper trigger={<ConfigureSniperButton />} /> */}
                <ManageTwitter trigger={<ManageTwitterButton />} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full w-full flex-grow flex-col lg:hidden",
          currentSnapped.side !== "none" && "lg:flex",
        )}
      >
        {/* Actions */}
        <div className="flex h-auto w-full items-center gap-x-2 border-b border-border bg-card px-4 pb-4 pt-1">
          <div className="items-center gap-x-2">
            {isLoading ? (
              <Skeleton className="h-9 w-9 rounded-[8px]" />
            ) : (
              <ManageTwitter trigger={<ManageTwitterButton isMobile />} />
            )}
          </div>

          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={18}
          />

          <div className="w-full flex-grow items-center gap-x-2">
            {isLoading ? (
              <TwitterMonitorActionsSkeleton
                variant="mobile"
                className="col-span-2"
              />
            ) : (
              <>
                {/* <ConfigureSniper trigger={<ConfigureSniperButton />} /> */}
                <AddTwitter trigger={<AddTwitterButton />} />
              </>
            )}
          </div>
        </div>

        {/* Twitter Type */}
        <div className="w-full pt-4">
          <ScrollArea className="h-auto w-full">
            <ScrollBar orientation="horizontal" className="h-[1px]" />
            <div className="flex h-[40px] gap-x-2">
              {isLoading ? (
                <TwitterMonitorMenuSkeleton variant="mobile" count={6} />
              ) : (
                menuList.map((menu, index) => {
                  const isSelected = menu.label === selectedSettingMenu;
                  return (
                    <div
                      key={menu?.label}
                      className="flex cursor-pointer justify-center gap-2"
                    >
                      <button
                        onClick={() => setSelectedSettingMenu(menu?.label)}
                        className={cn(
                          "relative flex h-[40px] w-fit items-center justify-start gap-x-2 rounded-[8px] py-2 pl-1 pr-3 duration-300 xl:w-full",
                          isSelected ? "bg-primary/[12%]" : "bg-white/[6%]",
                          index === 0 && "ml-4",
                          index === menuList.length - 1 && "mr-4",
                        )}
                      >
                        <span
                          className={cn(
                            "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                            isSelected && "bg-primary",
                          )}
                        ></span>

                        <div className="relative aspect-square size-6 flex-shrink-0">
                          <Image
                            src={
                              isSelected
                                ? menu?.icons?.active
                                : menu?.icons?.inactive
                            }
                            alt={menu?.label + "Icon"}
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>

                        <span
                          className={cn(
                            "inline-block text-nowrap text-sm text-fontColorSecondary duration-300",
                            isSelected
                              ? "font-geistMedium text-[#DF74FF]"
                              : "font-geistRegular",
                          )}
                        >
                          {menu?.label}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* List */}
        <div className="flex h-full w-full flex-col">
          <div className="relative grid w-full flex-grow grid-cols-1 px-4 pt-4">
            {isLoading ? (
              <TwitterMonitorListSkeleton
                variant="small"
                isFullscreen={false}
                count={5}
                ref={mobileSkeletonRef}
              />
            ) : (
              <AllVariantTwitterMonitorList
                list={finalMessages}
                variant="small"
                isFullscreen={false}
                ref={mobileListRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
