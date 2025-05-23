"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import TrendingCardMobile from "@/components/customs/cards/mobile/TrendingCardMobile";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";

export default function TrendingListMobile({
  list,
}: {
  list: TrendingDataMessageType[];
}) {
  const isTrendingTutorial = useUserInfoStore(
    (state) => state.isTrendingTutorial,
  );

  return (
    <div className="flex w-full flex-grow flex-col px-4 pb-8 lg:px-0">
      <div className="nova-scroller relative flex w-full flex-grow">
        <Virtuoso
          style={
            isTrendingTutorial
              ? {
                  overflow: "hidden",
                }
              : {
                  overflowY: "scroll",
                }
          }
          className="w-full"
          totalCount={list.length}
          itemContent={(index: number) =>
            list[index] && (
              <TrendingCardMobile
                isFirst={index === 0}
                key={list[index].mint}
                tokenData={list[index]}
              />
            )
          }
        />
      </div>
    </div>
  );
}
