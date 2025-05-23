"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useMemo } from "react";
import { useTwitterMonitorModalFullscreenStore } from "@/stores/footer/use-twitter-monitor-modal-fullscreen.store";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import AllVariantTwitterMonitorList from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import RetweetVariantTwitterMonitorList from "@/components/customs/lists/footer/RetweetVariantTwitterMonitorList";
import PostVariantTwitterMonitorList from "@/components/customs/lists/footer/PostVariantTwitterMonitorList";
import QuoteRetweetVariantTwitterMonitorList from "@/components/customs/lists/footer/QuoteRetweetVariantTwitterMonitorList";
import CommentVariantTwitterMonitorList from "@/components/customs/lists/footer/CommentVariantTwitterMonitorList";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { TwitterMonitorMessageType } from "@/types/ws-general";
// ######## Constants ☑️ ########
import { SOLANA_ADDRESS_REGEX } from "@/constants/regex";
import AddTwitter from "./AddTwitter";
import ConfigureSniper from "./ConfigureSniper";
import ManageTwitter from "./ManageTwitter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTwitterMonitorLockedStore } from "@/stores/footer/use-twitter-monitor-locked.store";
import { ConfigureSniperButton } from "@/components/customs/buttons/ConfigureSniperButton";
import { AddTwitterButton } from "@/components/customs/buttons/AddTwitterButton";
import { ManageTwitterButton } from "@/components/customs/buttons/ManageTwitterButton";
import DexBuySettings from "@/components/customs/DexBuySettings";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

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
export default function TwitterMonitorModalContent({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const messages = useTwitterMonitorMessageStore((state) => state.messages);

  // Messages ✉️
  const commentMessages = useMemo(
    () => messages.filter((message) => message?.type === "comment"),
    [messages],
  );
  const retweetMessages = useMemo(
    () => messages.filter((message) => message?.type === "retweet"),
    [messages],
  );
  const postMessages = useMemo(
    () => messages.filter((message) => message?.type === "post"),
    [messages],
  );
  const quoteRetweetMessages = useMemo(
    () => messages.filter((message) => message?.type === "quote_retweet"),
    [messages],
  );

  // Distributed Messages ✉️
  const [
    classifiedAndFilteredMessagesGrid1,
    classifiedAndFilteredMessagesGrid2,
    classifiedAndFilteredMessagesGrid3,
  ] = useMemo(
    () => distributeMessages(messages, minMessagesPerGrid),
    [messages],
  );
  const [commentMessagesGrid1, commentMessagesGrid2, commentMessagesGrid3] =
    useMemo(
      () => distributeMessages(commentMessages, minMessagesPerGrid),
      [commentMessages],
    );
  const [retweetMessagesGrid1, retweetMessagesGrid2, retweetMessagesGrid3] =
    useMemo(
      () => distributeMessages(retweetMessages, minMessagesPerGrid),
      [retweetMessages],
    );
  const [postMessagesGrid1, postMessagesGrid2, postMessagesGrid3] = useMemo(
    () => distributeMessages(postMessages, minMessagesPerGrid),
    [postMessages],
  );
  const [
    quoteRetweetMessagesGrid1,
    quoteRetweetMessagesGrid2,
    quoteRetweetMessagesGrid3,
  ] = useMemo(
    () => distributeMessages(quoteRetweetMessages, minMessagesPerGrid),
    [quoteRetweetMessages],
  );

  // console.log("ALL MESSAGES ✨", {
  //   messages,
  //   classifiedAndFilteredMessages,
  //   retweetMessages,
  //   postMessages,
  //   quoteRetweetMessages,
  //   commentMessages,
  // });

  // Menu Configuration ✨
  const [selectedSettingMenu, setSelectedSettingMenu] =
    useState<MenuLabel>("All Twitter");

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

  // Responsive Configuration 📱
  const width = useWindowSizeStore((state) => state.width);

  const {
    setTwitterMonitorModalMode: setTwitterModalMode,
    setIsOpenTwitterMonitorModal: setOpenTwitterMonitorModal,
  } = useTwitterMonitorLockedStore();

  const { popups, setPopupState, togglePopup } = usePopupStore();
  const twitterPopup = popups.find((p) => p.name === "twitter");
  if (!twitterPopup) throw new Error("Popup not found");

  const { twitterMonitorModalFullscreen, setTwitterMonitorModalFullscreen } =
    useTwitterMonitorModalFullscreenStore();
  useEffect(() => {
    if (width) {
      if (width < 768 && twitterMonitorModalFullscreen) {
        setTwitterMonitorModalFullscreen(false);
      }
    }
  }, [width, twitterMonitorModalFullscreen]);

  return (
    <>
      {/* Mobile */}
      {!twitterMonitorModalFullscreen && (
        <div
          className={cn(
            "flex h-auto w-full flex-col justify-between pb-4 pt-[14px] md:hidden",
            !twitterMonitorModalFullscreen && "md:flex",
          )}
        >
          <div className="flex w-full items-center justify-between border-b border-border px-4 pb-3">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
              Twitter Monitor
              {/* {messages.length} */}
            </h4>

            <div className="flex w-fit items-center gap-x-2">
              {/* <button
                onClick={() =>
                  setTwitterMonitorModalFullscreen(
                    !twitterMonitorModalFullscreen,
                  )
                }
                className="relative hidden aspect-square h-6 w-6 xl:block"
              >
                <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/footer/fullscreen.png"
                    alt="Fullscreen Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button> */}
              <button
                onClick={() => {
                  setPopupState(twitterPopup.name, (p) => ({
                    ...p,
                    mode: "popup" as const,
                  }));
                  document.body.style.overflow = "";
                }}
                className="relative hidden aspect-square h-5 w-5 xl:block"
              >
                <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0 duration-300 hover:opacity-70">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src="/icons/lock.svg"
                          alt="Lock Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="z-[1000]">
                        <p>Pop out</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </button>
              <button
                onClick={() => togglePopup(twitterPopup.name)}
                className="relative hidden aspect-square h-6 w-6 xl:block"
              >
                <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
              {/* <button
                onClick={() => toggleModal()}
                className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button> */}
            </div>
          </div>

          <div className="hidden w-full flex-grow items-center gap-x-2 px-4 md:flex md:pt-4">
            <div className="flex items-center gap-x-2">
              <ManageTwitter
                trigger={<ManageTwitterButton isFullscreen={false} />}
              />
              {/* <ResponsiveManageTwitter
                isOpen={isManageTwitterDesktopOpen}
                onOpenChange={setIsManageTwitterDesktopOpen}
                monitorDraftAccounts={monitorDraftAccounts}
                handleRemoveAccountFromMonitorDraft={
                  handleRemoveAccountFromMonitorDraft
                }
                handleSubmit={handleManageTwitterSubmit}
                isFullscreen={twitterMonitorModalFullscreen}
                isJustIconButton
              /> */}
            </div>

            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={18}
            />

            <div className="flex flex-grow items-center gap-x-2">
              {/* <ConfigureSniper trigger={<ConfigureSniperButton />} /> */}
              <AddTwitter trigger={<AddTwitterButton />} />
            </div>
          </div>

          <div className="hidden w-full items-center justify-center px-4 md:flex md:pt-4">
            <div className="scale-[0.95]">
              <DexBuySettings variant="Twitter Monitor Footer" />
            </div>
          </div>
        </div>
      )}

      <div className={"flex w-full flex-grow items-center justify-center"}>
        <div
          className={cn(
            "hidden h-full w-[286px] flex-shrink-0 flex-col items-center justify-between border-r border-border px-[20px] py-5 md:flex",
            !twitterMonitorModalFullscreen && "hidden md:hidden",
          )}
        >
          {/* Header */}
          <div className="flex w-full items-center justify-between pb-2">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary md:text-[20px]">
              Twitter Monitor
              {/* {messages.length} */}
            </h4>

            <div className="flex w-fit items-center gap-x-1.5">
              <button
                onClick={() =>
                  setTwitterMonitorModalFullscreen(
                    !twitterMonitorModalFullscreen,
                  )
                }
                className="relative hidden aspect-square h-6 w-6 xl:block"
              >
                <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/footer/minimize.png"
                    alt="Minimize Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
              {/* <button
                onClick={() => toggleModal()}
                className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button> */}
            </div>
          </div>

          {/* Content */}
          <div className="mt-2 flex h-fit w-full flex-col items-center gap-y-2">
            {menuList.map((item, i) => {
              const isSelected = item.label === selectedSettingMenu;

              return (
                <button
                  key={i + item?.label}
                  onClick={() => setSelectedSettingMenu(item?.label)}
                  className={cn(
                    "relative flex h-12 w-full items-center justify-start gap-x-2 rounded-[8px] py-2 pl-2 pr-4 duration-300 md:pr-2 xl:pr-1",
                    isSelected
                      ? "bg-primary/[12%]"
                      : "bg-white/[6%] md:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "h-8 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                      isSelected && "bg-primary",
                    )}
                  ></span>

                  <div className="relative aspect-square size-6 flex-shrink-0">
                    <Image
                      src={
                        isSelected ? item?.icons?.active : item?.icons?.inactive
                      }
                      alt={item?.label + "Icon"}
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>

                  <span
                    className={cn(
                      "inline-block text-nowrap text-base text-fontColorSecondary duration-300",
                      isSelected && "font-geistSemiBold text-[#DF74FF]",
                    )}
                  >
                    {item?.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {twitterMonitorModalFullscreen && (
            <div className="mt-auto flex w-full flex-col items-center justify-center gap-y-2">
              <AddTwitter trigger={<AddTwitterButton isFullscreen />} />
              {/* <ConfigureSniper
                trigger={<ConfigureSniperButton isFullscreen />}
              /> */}
              <ManageTwitter trigger={<ManageTwitterButton isFullscreen />} />
            </div>
          )}
        </div>

        {/* Twitter Card Grids */}
        <div
          className={cn(
            "flex h-full w-full flex-col",
            !twitterMonitorModalFullscreen && "md:mt-0",
          )}
        >
          {/* {twitterMonitorModalFullscreen ? (
            <div className="relative grid w-full flex-grow grid-cols-1 gap-x-4 px-4 xl:grid-cols-2 2xl:grid-cols-3">
              {selectedSettingMenu === "All Twitter" && (
                <>
                  <AllVariantTwitterMonitorList
                    list={messages}
                    variant="large"
                    isFullscreen={true}
                    className="flex xl:hidden"
                  />
                  <AllVariantTwitterMonitorList
                    list={classifiedAndFilteredMessagesGrid1}
                    variant="large"
                    isFullscreen={true}
                    className="hidden xl:flex"
                  />
                  <AllVariantTwitterMonitorList
                    list={[
                      ...classifiedAndFilteredMessagesGrid2,
                      ...classifiedAndFilteredMessagesGrid3,
                    ]}
                    variant="large"
                    isFullscreen={true}
                    className="hidden xl:flex 2xl:hidden"
                  />
                  <AllVariantTwitterMonitorList
                    list={classifiedAndFilteredMessagesGrid2}
                    variant="large"
                    isFullscreen={true}
                    className="hidden 2xl:flex"
                  />
                  <AllVariantTwitterMonitorList
                    list={classifiedAndFilteredMessagesGrid3}
                    variant="large"
                    isFullscreen={true}
                    className="hidden 2xl:flex"
                  />
                </>
              )}
              {selectedSettingMenu === "Comment Twitter" && (
                <>
                  <CommentVariantTwitterMonitorList
                    list={commentMessages}
                    className="flex xl:hidden"
                  />
                  <CommentVariantTwitterMonitorList
                    list={commentMessagesGrid1}
                    className="hidden xl:flex"
                  />
                  <CommentVariantTwitterMonitorList
                    list={[...commentMessagesGrid2, ...commentMessagesGrid3]}
                    className="hidden xl:flex 2xl:hidden"
                  />
                  <CommentVariantTwitterMonitorList
                    list={commentMessagesGrid2}
                    className="hidden 2xl:flex"
                  />
                  <CommentVariantTwitterMonitorList
                    list={commentMessagesGrid3}
                    className="hidden 2xl:flex"
                  />
                </>
              )}
              {selectedSettingMenu === "Retweet Twitter" && (
                <>
                  <RetweetVariantTwitterMonitorList
                    list={retweetMessages}
                    className="flex xl:hidden"
                  />
                  <RetweetVariantTwitterMonitorList
                    list={retweetMessagesGrid1}
                    className="hidden xl:flex"
                  />
                  <RetweetVariantTwitterMonitorList
                    list={[...retweetMessagesGrid2, ...retweetMessagesGrid3]}
                    className="hidden xl:flex 2xl:hidden"
                  />
                  <RetweetVariantTwitterMonitorList
                    list={retweetMessagesGrid2}
                    className="hidden 2xl:flex"
                  />
                  <RetweetVariantTwitterMonitorList
                    list={retweetMessagesGrid3}
                    className="hidden 2xl:flex"
                  />
                </>
              )}
              {selectedSettingMenu === "Post Twitter" && (
                <>
                  <PostVariantTwitterMonitorList
                    list={postMessagesGrid1}
                    className="flex xl:hidden"
                  />
                  <PostVariantTwitterMonitorList
                    list={postMessagesGrid1}
                    className="hidden xl:flex"
                  />
                  <PostVariantTwitterMonitorList
                    list={[...postMessagesGrid2, ...postMessagesGrid3]}
                    className="hidden xl:flex 2xl:hidden"
                  />
                  <PostVariantTwitterMonitorList
                    list={postMessagesGrid2}
                    className="hidden 2xl:flex"
                  />
                  <PostVariantTwitterMonitorList
                    list={postMessagesGrid3}
                    className="hidden 2xl:flex"
                  />
                </>
              )}
              {selectedSettingMenu === "Quote Retweet" && (
                <>
                  <QuoteRetweetVariantTwitterMonitorList
                    list={quoteRetweetMessagesGrid1}
                    className="flex xl:hidden"
                  />
                  <QuoteRetweetVariantTwitterMonitorList
                    list={quoteRetweetMessagesGrid1}
                    className="hidden xl:flex"
                  />
                  <QuoteRetweetVariantTwitterMonitorList
                    list={[
                      ...quoteRetweetMessagesGrid2,
                      ...quoteRetweetMessagesGrid3,
                    ]}
                    className="flex 2xl:hidden"
                  />
                  <QuoteRetweetVariantTwitterMonitorList
                    list={quoteRetweetMessagesGrid2}
                    className="hidden 2xl:flex"
                  />
                  <QuoteRetweetVariantTwitterMonitorList
                    list={quoteRetweetMessagesGrid3}
                    className="hidden 2xl:flex"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="relative grid w-full flex-grow grid-cols-1 px-4">
              <AllVariantTwitterMonitorList
                list={finalMessages}
                variant="small"
                isFullscreen={false}
              />
            </div>
          )} */}
          <div className="relative grid w-full flex-grow grid-cols-1 px-4">
            <AllVariantTwitterMonitorList
              list={finalMessages}
              variant="small"
              isFullscreen={false}
              showScrollbar={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex h-16 w-full items-center gap-x-2 border-t border-border bg-card p-4 md:hidden">
        <div className="items-center gap-x-2">
          <ManageTwitter trigger={<ManageTwitterButton isMobile />} />
        </div>

        <Separator
          color="#202037"
          orientation="vertical"
          unit="fixed"
          fixedHeight={18}
        />

        <div className="flex w-full flex-grow items-center justify-center gap-x-2">
          {/* <ConfigureSniper trigger={<ConfigureSniperButton />} /> */}
          <AddTwitter trigger={<AddTwitterButton />} />
        </div>
      </div>
    </>
  );
}
