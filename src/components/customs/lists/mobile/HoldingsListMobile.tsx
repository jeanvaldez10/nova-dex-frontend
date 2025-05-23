"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMemo } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import HoldingsCardMobile from "@/components/customs/cards/mobile/HoldingsCardMobile";
// ######## Types 🗨️ ########
import { HoldingsTransformedTokenData } from "@/types/ws-general";

export default function HoldingsListMobile({
  list,
}: {
  list?: HoldingsTransformedTokenData[];
}) {
  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  const sortedList = useMemo(() => {
    if (!list) return [];

    return list?.sort((a, b) => {
      const lastBoughtA = Math.max(
        ...a.list.map((item) => item.token.lastBought),
      );
      const lastBoughtB = Math.max(
        ...b.list.map((item) => item.token.lastBought),
      );
      return 1 * (lastBoughtB - lastBoughtA);
    });
  }, [list]);

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow">
        <div className="nova-scroller relative flex w-full flex-grow px-4 lg:px-0">
          <Virtuoso
            style={
              isHoldingsTutorial
                ? {
                    overflow: "hidden",
                  }
                : {
                    overflowY: "scroll",
                  }
            }
            className="w-full"
            totalCount={sortedList.length}
            itemContent={(index: number) =>
              sortedList[index] && (
                <HoldingsCardMobile
                  key={sortedList[index].token.mint}
                  data={sortedList[index]}
                  isFirst={index === 0}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
