"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useMemo } from "react";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
import HoldingsCard from "@/components/customs/cards/HoldingsCard";
import HeadCol from "@/components/customs/tables/HeadCol";
// ######## Types 🗨️ ########
import { HoldingsTransformedTokenData } from "@/types/ws-general";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";

export default function HoldingsTable({
  list,
}: {
  list?: HoldingsTransformedTokenData[];
}) {
  const { sortType, sortRow, setSortRow, setSortType } =
    useHoldingsFilterStore();

  const sortedList = useMemo(() => {
    if (!list) return [];

    if (sortType === "NONE") return list;

    const sortedItems = [...list];
    const multiplier = sortType === "ASC" ? 1 : -1;

    switch (sortRow) {
      case "TOKEN":
        sortedItems.sort((a, b) => {
          const lastBoughtA = Math.max(
            ...a.list.map((item) => item.token.lastBought || 0),
          );
          const lastBoughtB = Math.max(
            ...b.list.map((item) => item.token.lastBought || 0),
          );

          return multiplier * (lastBoughtA - lastBoughtB);
        });
        break;

      case "INVESTED":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce(
            (sum, item) => sum + (item.token?.investedSol || 0),
            0,
          );
          const valueB = b.list.reduce(
            (sum, item) => sum + (item.token?.investedSol || 0),
            0,
          );
          return multiplier * (valueA - valueB);
        });
        break;

      case "REMAINING":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce((sum, item) => {
            const balance = item.token?.balance || 0;
            const price = item.token?.price?.price_sol || 0;
            return sum + balance * price;
          }, 0);
          const valueB = b.list.reduce((sum, item) => {
            const balance = item.token?.balance || 0;
            const price = item.token?.price?.price_sol || 0;
            return sum + balance * price;
          }, 0);
          return multiplier * (valueA - valueB);
        });
        break;

      case "SOLD":
        sortedItems.sort((a, b) => {
          const valueA = a.list.reduce(
            (sum, item) => sum + (item.token?.soldSol || 0),
            0,
          );
          const valueB = b.list.reduce(
            (sum, item) => sum + (item.token?.soldSol || 0),
            0,
          );
          return multiplier * (valueA - valueB);
        });
        break;

      case "PNL":
        sortedItems.sort((a, b) => {
          const calcPnLPercentage = (data: HoldingsTransformedTokenData) => {
            let totalInvested = 0;
            let totalSold = 0;
            let currentValue = 0;

            data.list.forEach((item) => {
              totalInvested += item.token?.investedSol || 0;
              totalSold += item.token?.soldSol || 0;
              const balance = item.token?.balance || 0;
              const price = item.token?.price?.price_sol || 0;
              currentValue += balance * price;
            });

            const totalValue = totalSold + currentValue;
            const pnlSol = totalValue - totalInvested;

            if (totalInvested === 0) return 0;

            return (pnlSol / totalInvested) * 100;
          };

          const pnlPercentageA = calcPnLPercentage(a);
          const pnlPercentageB = calcPnLPercentage(b);

          return multiplier * (pnlPercentageA - pnlPercentageB);
        });
        break;
    }

    return sortedItems;
  }, [list, sortRow, sortType]);

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token name",
      className: "min-w-[200px]",
      sortButton: (
        <button
          title="Sort by Token"
          onClick={() => {
            setSortRow("TOKEN");
            setSortType(
              sortType === "ASC"
                ? "DESC"
                : sortType === "DESC"
                  ? "NONE"
                  : "ASC",
            );
          }}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortRow === "TOKEN" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "TOKEN" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Wallet",
      tooltipContent: "Wallet the token was bought under",
      className: "min-w-[50px]",
    },
    {
      label: "Invested",
      tooltipContent: "Amount invested in Solana & USD values",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Invested"
          onClick={() => {
            setSortRow("INVESTED");
            setSortType(
              sortType === "ASC"
                ? "DESC"
                : sortType === "DESC"
                  ? "NONE"
                  : "ASC",
            );
          }}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortRow === "INVESTED" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "INVESTED" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Remaining",
      tooltipContent:
        "Amount remaining which has been bought but has not been sold",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Remaining"
          onClick={() => {
            setSortRow("REMAINING");
            setSortType(
              sortType === "ASC"
                ? "DESC"
                : sortType === "DESC"
                  ? "NONE"
                  : "ASC",
            );
          }}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortRow === "REMAINING" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "REMAINING" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Sold",
      tooltipContent: "Amount sold from the invested amount",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by Sold"
          onClick={() => {
            setSortRow("SOLD");
            setSortType(
              sortType === "ASC"
                ? "DESC"
                : sortType === "DESC"
                  ? "NONE"
                  : "ASC",
            );
          }}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortRow === "SOLD" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "SOLD" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "P&L",
      tooltipContent:
        "Total profit/loss percentage. Green is profit and red is loss",
      className: "min-w-[50px]",
      sortButton: (
        <button
          title="Sort by P&L"
          onClick={() => {
            setSortRow("PNL");
            setSortType(
              sortType === "ASC"
                ? "DESC"
                : sortType === "DESC"
                  ? "NONE"
                  : "ASC",
            );
          }}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortRow === "PNL" && sortType === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortRow === "PNL" && sortType === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Actions",
      tooltipContent:
        " Action buttons which include sell, share and hide the holding",
      className: "min-w-[50px] justify-end",
    },
  ];

  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden rounded-[8px] border border-border">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        <div className="sticky top-0 flex h-10 min-w-max items-center border-b border-border bg-[#080811] px-4">
          {HeaderData.map((item, index) => (
            <HeadCol key={index} {...item} />
          ))}
        </div>

        <div className="nova-scroller relative flex w-full flex-grow">
          <Virtuoso
            className="w-full"
            style={
              isHoldingsTutorial
                ? {
                    overflow: "hidden",
                  }
                : {
                    overflowY: "scroll",
                  }
            }
            totalCount={sortedList.length}
            itemContent={(index: number) =>
              sortedList[index] && (
                <HoldingsCard
                  isFirst={index === 0}
                  index={index}
                  key={sortedList[index].token.mint}
                  data={sortedList[index]}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
