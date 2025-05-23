"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import HeadCol from "@/components/customs/tables/HeadCol";
import TrendingCard from "@/components/customs/cards/TrendingCard";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";

export default function TrendingTable({
  list,
}: {
  list: TrendingDataMessageType[];
}) {
  const isTrendingTutorial = useUserInfoStore(
    (state) => state.isTrendingTutorial,
  );

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token name",
      className: "min-w-[196px]",
    },
    {
      label: "Created",
      tooltipContent: "Time passed since creation",
      className: "min-w-[90px]",
    },
    {
      label: "Liquidity",
      tooltipContent: "Liquidity in the token",
      className: "min-w-[80px]",
    },
    {
      label: "Mkt cap",
      tooltipContent: "Includes dilated value and token price in USD",
      className: "min-w-[80px]",
    },
    {
      label: "Volume",
      tooltipContent: "The total number of coins traded in a specific period",
      className: "min-w-[72px]",
    },
    {
      label: "TXNS",
      tooltipContent: "The total number of coins traded in a specific period",
      className: "min-w-[75px]",
    },
    // {
    //   label: "Holders",
    //   tooltipContent: "Total wallets holding supply of this token",
    //   className: "min-w-[80px]",
    // },
    {
      label: "1M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 1 minute",
      className: "min-w-[70px]",
    },
    {
      label: "5M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 5 minutes",
      className: "min-w-[70px]",
    },
    {
      label: "30M",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 30 minutes",
      className: "min-w-[70px]",
    },
    {
      label: "1H",
      tooltipContent:
        "Percentage increase/decrease in the token market cap in 1 hour",
      className: "min-w-[70px]",
    },
    {
      label: "Audit Results",
      tooltipContent: "Various indicators which show a tokens risk",
      className: "min-w-[170px]",
    },
    {
      label: "Actions",
      tooltipContent: "Purchase the token",
      className: "min-w-[90px] justify-end",
    },
  ];

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden rounded-[8px] border border-border">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        <div className="sticky top-0 flex h-10 min-w-max items-center border-b border-border bg-[#080811] pl-4 pr-4">
          {HeaderData.map((item, index) => (
            <HeadCol key={index} {...item} />
          ))}
        </div>

        <div className="nova-scroller virtuoso__hide__scrollbar relative flex w-full flex-grow">
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
                <TrendingCard
                  index={index}
                  isFirst={index === 0}
                  key={list[index].mint}
                  tokenData={list[index]}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
