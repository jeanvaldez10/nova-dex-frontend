"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { Virtuoso } from "react-virtuoso";
// ######## Components 🧩 ########
const WalletTrackerCard = dynamic(
  () => import("@/components/customs/cards/footer/WalletTrackerCard"),
);
const WalletTrackerCardPopOut = dynamic(
  () => import("@/components/customs/cards/footer/WalletTrackerCardPopOut"),
);
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Constants ☑️ ########
import { dummyWalletTrackerData } from "@/constants/dummy-data";
import { useWalletTrackerFilterStore } from "@/stores/dex-setting/use-wallet-tracker-filter.store";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import SortButton from "../../SortButton";
import dynamic from "next/dynamic";

// ######## Shared Column Configuration ########
// Define column fractions (relative widths) instead of fixed pixel values
export const WALLET_TRACKER_COLUMN_RATIOS = {
  token: 1.8, // 18% of available space
  type: 0.6, // 6% of available space
  amount: 1, // 10% of available space
  marketCap: 1.1, // 11% of available space
  txns: 0.9, // 9% of available space
  walletName: 1.2, // 12% of available space
  remaining: 2.1, // 21% of available space
  actions: 0.9, // 9% of available space
};

// For backward compatibility, still provide pixel values for components that need it
export const WALLET_TRACKER_COLUMN_WIDTHS = {
  token: { width: "180px", className: "min-w-[180px]" },
  type: { width: "65px", className: "min-w-[55px] max-w-[65px]" },
  amount: { width: "100px", className: "min-w-[100px]" },
  marketCap: { width: "110px", className: "min-w-[110px]" },
  txns: { width: "90px", className: "min-w-[90px]" },
  walletName: { width: "120px", className: "min-w-[120px]" },
  remaining: { width: "200px", className: "min-w-[200px]" },
  actions: { width: "90px", className: "min-w-[90px] max-w-[90px]" },
};

const GRID_TEMPLATE_COLUMNS_PROPORTIONAL = `
  ${WALLET_TRACKER_COLUMN_RATIOS.token}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.type}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.amount}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.marketCap}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.txns}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.walletName}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.remaining}fr
  ${WALLET_TRACKER_COLUMN_RATIOS.actions}fr
`;

export default function WalletTrackerTable({
  virtualize = true,
  variant = "normal",
}: {
  virtualize: boolean;
  variant?: "normal" | "pop-out";
}) {
  const pathname = usePathname();
  const messages = useWalletTrackerMessageStore((state) => state.messages);
  const [sortRow, setSortRow] = useState<"" | "TXNS">("");
  const [sortType, setSortType] = useState<"DESC" | "ASC" | "NONE">("NONE");

  const { minSol, excludeSells, excludeBuys } = useWalletTrackerFilterStore();

  const isWalletTrackerTutorial = useUserInfoStore(
    (state) => state.isWalletTrackerTutorial,
  );

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );

  // console.log(messages, "filter");

  const filteredFinalData = useMemo(() => {
    // First filter by addresses
    let filteredMessages =
      currentSelectedAddresses.length > 0
        ? messages?.filter((item) =>
            pathname !== "/wallet-tracker"
              ? true
              : currentSelectedAddresses.includes(item?.walletAddress),
          )
        : messages;

    // Apply the wallet tracker filters
    if (filteredMessages) {
      // Filter by minimum SOL amount
      if (minSol > 0) {
        filteredMessages = filteredMessages.filter(
          (item) => parseFloat(item.solAmount) >= minSol,
        );
      }

      // Filter by transaction type
      if (excludeSells) {
        filteredMessages = filteredMessages.filter(
          (item) => item.type.toLowerCase() !== "sell",
        );
      }

      if (excludeBuys) {
        filteredMessages = filteredMessages.filter(
          (item) => item.type.toLowerCase() !== "buy",
        );
      }
    }

    // Apply sorting logic
    if (sortType === "NONE" || !filteredMessages) {
      return filteredMessages || []; // Return unsorted data
    }

    return filteredMessages.sort((a, b) => {
      if (sortRow === "TXNS") {
        return sortType === "ASC"
          ? a.buys + a.sells - (b.buys + b.sells)
          : b.buys + b.sells - (a.buys + a.sells);
      } else {
        return 0;
      }
    });
  }, [
    messages,
    currentSelectedAddresses,
    sortType,
    sortRow,
    pathname,
    minSol,
    excludeSells,
    excludeBuys,
  ]);

  const quickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const { amountType, setAmountType } = useWalletTrackerFilterStore();
  const HeaderDataNormal = useMemo(
    () => [
      {
        label: "Token",
        tooltipContent: "Token Name",
        className: WALLET_TRACKER_COLUMN_WIDTHS.token.className,
      },
      {
        label: "Type",
        tooltipContent: "Type of transaction",
        className: WALLET_TRACKER_COLUMN_WIDTHS.type.className,
      },
      {
        label: "Amount",
        tooltipContent:
          "Amount of SOL put in by the tracked wallet and the amount of tokens bought",
        className: WALLET_TRACKER_COLUMN_WIDTHS.amount.className,
        sortButton: (
          <>
            <SortButton
              type="usdc-or-sol"
              value={amountType}
              setValue={setAmountType}
            />
          </>
        ),
      },
      {
        label: "Market Cap",
        tooltipContent: "Indicates token value",
        className: WALLET_TRACKER_COLUMN_WIDTHS.marketCap.className,
      },
      {
        label: "TXNS",
        tooltipContent: "The total number of coins traded in a specific period",
        className: WALLET_TRACKER_COLUMN_WIDTHS.txns.className,
        sortButton: (
          <button
            onClick={() => {
              setSortRow("TXNS");
              setSortType(
                sortType === "ASC"
                  ? "DESC"
                  : sortType === "DESC"
                    ? "NONE"
                    : "ASC",
              );
            }}
            className="flex cursor-pointer items-center -space-x-[7.5px]"
            title="Sort by Transactions"
          >
            <HiArrowNarrowUp
              className={cn(
                "text-sm duration-300",
                sortRow === "TXNS" && sortType === "ASC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
            <HiArrowNarrowDown
              className={cn(
                "text-sm duration-300",
                sortRow === "TXNS" && sortType === "DESC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
          </button>
        ),
      },
      {
        label: "Wallet Name",
        tooltipContent: "The name provided for the wallet",
        className: WALLET_TRACKER_COLUMN_WIDTHS.walletName.className,
      },
      {
        label: "Remaining",
        tooltipContent: "The amount of tokens left in the tracked wallet",
        className: WALLET_TRACKER_COLUMN_WIDTHS.remaining.className,
      },
      {
        label: "Actions",
        tooltipContent: "Action button which includes quick buy",
        className: WALLET_TRACKER_COLUMN_WIDTHS.actions.className,
      },
    ],
    [amountType, setAmountType],
  );

  const HeaderDataPopup = useMemo(
    () => [
      {
        label: "Token",
        tooltipContent: "Token Name",
        className: "min-w-[340px]",
      },
      {
        label: "Wallet Name",
        tooltipContent: "The name provided for the wallet",
        className: "min-w-[100px] max-w-[200px]",
      },
      {
        label: "Amount",
        tooltipContent:
          "Amount of SOL put in by the tracked wallet and the amount of tokens bought",
        className: "min-w-[120px] w-full",
        sortButton: (
          <>
            <SortButton
              type="usdc-or-sol"
              value={amountType}
              setValue={setAmountType}
            />
          </>
        ),
      },
      {
        label: "Market Cap",
        tooltipContent: "Indicates token value",
        className: "min-w-[95px]",
      },
      {
        label: "Actions",
        tooltipContent: "Action button which includes quick buy",
        className: `w-full ${
          quickBuyAmount.toString().length > 1
            ? `min-w-[${120 + quickBuyAmount.toString().length * 10}ch] max-w-[${
                120 + quickBuyAmount.toString().length * 10
              }ch]`
            : ""
        }`,
      },
    ],
    [amountType, setAmountType],
  );

  const [headerType, setHeaderType] = useState<
    "normal" | "popup" | "small-popup"
  >("normal");

  // const { twitterMonitorModalMode } = useTwitterMonitorLockedStore()
  // const { walletTrackerModalMode, walletTrackerSize } = useWalletTrackerLockedStore()

  const scrollParentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // const popUpResponsive = walletTrackerSize.width < 770 && walletTrackerModalMode === "locked"
  const { popups } = usePopupStore();
  const windowName: WindowName = "wallet_tracker";
  const walletTracker = popups.find((value) => value.name === windowName)!;
  const { size, mode } = walletTracker;
  const popUpResponsive = size.width < 770 && mode !== "footer";
  const quickBuyLength = quickBuyAmount.toString().length;
  const dynamicWidth = 120 + quickBuyLength * 5;
  const smallerPopupResponsive = size.width < 600 && mode !== "footer";

  useEffect(() => {
    switch (variant) {
      case "normal":
        setHeaderType("normal");
        break;
      case "pop-out":
        if (smallerPopupResponsive) {
          setHeaderType("small-popup");
          break;
        }
        setHeaderType("popup");
        break;
      default:
        setHeaderType("normal");
        break;
    }
  }, [variant, smallerPopupResponsive]);

  // Tutorial mode rendering
  if (isWalletTrackerTutorial && virtualize) {
    return (
      <div className="relative flex h-full w-full flex-grow flex-col">
        <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
          {dummyWalletTrackerData && dummyWalletTrackerData.length ? (
            <div className="sticky top-0 z-[9] hidden h-[40px] w-full flex-shrink-0 border-b border-border bg-[#080811] pl-4 pr-5 xl:block">
              <div
                className="flex items-center"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID_TEMPLATE_COLUMNS_PROPORTIONAL,
                  width: "100%",
                }}
              >
                {HeaderDataNormal.map((item, index) => (
                  <HeadCol key={index} {...item} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="nova-scroller relative flex w-full flex-grow max-xl:p-3">
            {!!dummyWalletTrackerData && dummyWalletTrackerData.length > 0 && (
              <Virtuoso
                style={{
                  overflow: "hidden",
                }}
                className="w-full"
                totalCount={dummyWalletTrackerData.length}
                itemContent={(index: number) =>
                  dummyWalletTrackerData[index] && (
                    <WalletTrackerCard
                      index={index}
                      isFirst={index === 0}
                      key={`${dummyWalletTrackerData[index].timestamp}-${dummyWalletTrackerData[index].maker}-${dummyWalletTrackerData[index].signature}`}
                      tracker={dummyWalletTrackerData[index]}
                      type={
                        dummyWalletTrackerData[index].type.toLowerCase() as
                          | "buy"
                          | "sell"
                      }
                      responsiveBreakpoint={1280}
                      gridTemplateColumns={GRID_TEMPLATE_COLUMNS_PROPORTIONAL}
                    />
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-grow flex-col">
      <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
        {/* Normal view with grid layout */}
        {filteredFinalData &&
        filteredFinalData.length &&
        variant === "normal" ? (
          <div className="sticky top-0 z-[9] hidden h-[40px] w-full flex-shrink-0 border-b border-border bg-[#080811] pl-4 pr-5 xl:block">
            <div
              className="flex h-full items-center"
              style={{
                display: "grid",
                gridTemplateColumns: GRID_TEMPLATE_COLUMNS_PROPORTIONAL,
                width: "100%",
              }}
            >
              {(headerType === "normal"
                ? HeaderDataNormal
                : headerType === "small-popup"
                  ? HeaderDataPopup.filter((item) => item.label !== "Action")
                  : HeaderDataPopup
              ).map((item, index) => (
                <HeadCol key={index} {...item} />
              ))}
            </div>
          </div>
        ) : null}
        {/* Pop-out view with regular layout */}
        {variant === "pop-out" && (
          <div className="sticky top-0 z-[9] ml-4 mr-[10px] hidden h-[40px] flex-shrink-0 items-center overflow-x-hidden border-b border-border bg-[#080811] xl:flex">
            {(headerType === "normal"
              ? HeaderDataNormal
              : headerType === "small-popup"
                ? HeaderDataPopup.filter((item) => item.label !== "Action")
                : HeaderDataPopup
            ).map((item, index) => {
              if (item.label === "Token") {
                if (popUpResponsive) {
                  return (
                    <HeadCol
                      key={index}
                      {...item}
                      className={cn(
                        "w-full min-w-[200px]",
                        size.width < 500 && "min-w-[150px]",
                      )}
                      style={{
                        minWidth: `${size.width / 3 + 5}px`,
                      }}
                      isWithBorder={true}
                    />
                  );
                } else {
                  return (
                    <HeadCol
                      key={index}
                      {...item}
                      className={cn("w-full min-w-[340px]")}
                      style={{
                        minWidth: `${size.width / 3 + 10}px`,
                      }}
                      isWithBorder={true}
                    />
                  );
                }
              }
              if (item.label === "Wallet Name" && smallerPopupResponsive) {
                return (
                  <HeadCol
                    key={index}
                    {...item}
                    className="w-full min-w-[85px] max-w-[200px]"
                    label="Name"
                    isWithBorder={true}
                  />
                );
              }
              if (item.label === "Market Cap" && popUpResponsive) {
                return (
                  <HeadCol
                    key={index}
                    {...item}
                    className="w-full min-w-[65px]"
                    label="MC"
                    isWithBorder={true}
                  />
                );
              }
              if (item.label === "Actions" && popUpResponsive) {
                return (
                  <HeadCol
                    key={index}
                    {...item}
                    className={cn(
                      "flex h-full w-full items-center justify-start",
                      quickBuyLength > 1 &&
                        `min-w-[${dynamicWidth}ch] max-w-[${dynamicWidth}ch]`,
                      smallerPopupResponsive && "hidden",
                    )}
                  />
                );
              }
              return <HeadCol key={index} {...item} />;
            })}
          </div>
        )}

        {virtualize ? (
          <div
            ref={variant === "pop-out" ? scrollParentRef : undefined}
            className="nova-scroller relative flex h-full w-full flex-grow flex-col max-xl:p-4"
          >
            {mounted && !!filteredFinalData && filteredFinalData.length > 0 && (
              <Virtuoso
                className="w-full"
                customScrollParent={
                  variant === "pop-out"
                    ? (scrollParentRef.current as HTMLElement)
                    : undefined
                }
                totalCount={filteredFinalData.length}
                itemContent={(index: number) =>
                  filteredFinalData[index] &&
                  (variant === "normal" ? (
                    <WalletTrackerCard
                      index={index}
                      isFirst={index === 0}
                      key={`${filteredFinalData[index].timestamp}-${filteredFinalData[index].maker}-${filteredFinalData[index].signature}`}
                      tracker={filteredFinalData[index]}
                      type={
                        filteredFinalData[index].type.toLowerCase() as
                          | "buy"
                          | "sell"
                      }
                      responsiveBreakpoint={1280}
                      gridTemplateColumns={GRID_TEMPLATE_COLUMNS_PROPORTIONAL}
                    />
                  ) : (
                    <WalletTrackerCardPopOut
                      index={index}
                      isFirst={index === 0}
                      key={`${filteredFinalData[index].timestamp}-${filteredFinalData[index].maker}-${filteredFinalData[index].signature}`}
                      tracker={filteredFinalData[index]}
                      type={
                        filteredFinalData[index].type.toLowerCase() as
                          | "buy"
                          | "sell"
                      }
                      responsiveBreakpoint={1280}
                      variant="pop-out"
                    />
                  ))
                }
              />
            )}
          </div>
        ) : (
          <div className="nova-scroller relative flex w-full flex-grow flex-col max-md:gap-y-2 max-md:p-3">
            {!!filteredFinalData &&
              filteredFinalData.length > 0 &&
              filteredFinalData.map((item, index) =>
                variant === "normal" ? (
                  <WalletTrackerCard
                    index={index}
                    isFirst={false}
                    key={`${item.timestamp}-${item.maker}-${item.signature}`}
                    tracker={item}
                    type={item.type.toLowerCase() as "buy" | "sell"}
                    responsiveBreakpoint={768}
                    gridTemplateColumns={GRID_TEMPLATE_COLUMNS_PROPORTIONAL}
                  />
                ) : (
                  <WalletTrackerCardPopOut
                    index={index}
                    isFirst={false}
                    key={`${item.timestamp}-${item.maker}-${item.signature}`}
                    tracker={item}
                    type={item.type.toLowerCase() as "buy" | "sell"}
                    responsiveBreakpoint={768}
                    variant="pop-out"
                  />
                ),
              )}
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center p-4">
          <EmptyState state="Wallet" className="-mt-5 xl:mt-0" />
        </div>
      ) : (
        filteredFinalData &&
        filteredFinalData?.length === 0 && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <EmptyState state="No Result" className="-mt-5 xl:mt-0" />
          </div>
        )
      )}
    </div>
  );
}
