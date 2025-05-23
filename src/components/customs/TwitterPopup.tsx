"use client";

import React, { useState, useMemo } from "react";
import AllVariantTwitterMonitorList from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import ManageTwitter from "@/components/customs/modals/contents/footer/twitter/ManageTwitter";
import Separator from "@/components/customs/Separator";
import AddTwitter from "@/components/customs/modals/contents/footer/twitter/AddTwitter";
import { AddTwitterButton } from "@/components/customs/buttons/AddTwitterButton";
import { ManageTwitterButton } from "@/components/customs/buttons/ManageTwitterButton";
import DexBuySettings from "@/components/customs/DexBuySettings";
import { PopupWindow } from "@/components/customs/PopupWindow";

interface LockedTwitterMonitorProps {
  disableSnap?: boolean;
}

type MenuLabel =
  | "All Twitter"
  | "Comment Twitter"
  | "Retweet Twitter"
  | "Retweet Twitter"
  | "Post Twitter"
  | "Quote Retweet";

export default function TwitterPopup({
  disableSnap = false,
}: LockedTwitterMonitorProps) {
  const { messages } = useTwitterMonitorMessageStore();
  const [selectedSettingMenu, _] = useState<MenuLabel>("All Twitter");

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

  return (
    <PopupWindow
      title="Twitter Monitor"
      windowName="twitter"
      disableSnap={disableSnap}
      maxWidth={0.6}
      minWidth={420}
    >
      {/* Twitter Card Grids */}
      <div className="flex h-full w-full flex-col gap-4">
        <div className="mx-4 mt-4 flex w-full max-w-sm items-center gap-x-2">
          <div className="w-fit">
            <ManageTwitter
              trigger={<ManageTwitterButton isFullscreen={false} />}
            />
          </div>

          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={18}
          />

          <div className="w-full max-w-xs">
            <AddTwitter trigger={<AddTwitterButton isFullscreen={false} />} />
          </div>
        </div>

        <div className="mb-2 flex w-full px-4">
          <DexBuySettings variant="Pop Up" />
        </div>

        <div className="relative grid w-full flex-grow grid-cols-1 px-4">
          <AllVariantTwitterMonitorList
            list={finalMessages}
            variant="small"
            isFullscreen={false}
          />
        </div>
      </div>
    </PopupWindow>
  );
}
