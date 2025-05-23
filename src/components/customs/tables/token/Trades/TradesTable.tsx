"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";
// ######## Stores 🏪 ########
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useTokenCardsFilterStorePersist } from "@/stores/token/use-token-cards-filter-persist.store";
// ######## APIs 🛜 ########
import { getTradesTasks, TransactionType } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import Image from "next/image";
import SortButton from "@/components/customs/SortButton";
import HeadCol from "@/components/customs/tables/HeadCol";
const TradesCard = dynamic(
  () => import("@/components/customs/cards/token/TradesCard"),
);
import TradesMakerFilter from "@/components/customs/tables/token/Trades/TradesMakerFilter";
import TradesTypeFilter from "@/components/customs/tables/token/Trades/TradesTypeFilter";
import TradesTotalFilter from "@/components/customs/tables/token/Trades/TradesTotalFilter";
import WalletTrackerModal from "@/components/customs/modals/WalletTrackerModal";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
// ######## Types 🗨️ ########
import { TokenDataMessageType, TransactionInfo } from "@/types/ws-general";
import { Trade } from "@/types/nova_tv.types";
import { useOpenCustomTable } from "@/stores/token/use-open-custom-table";
import { usePopupStore } from "@/stores/use-popup-state";
import dynamic from "next/dynamic";

// Constants
const TRADES_LIMIT = 50; // Default limit for non-realtime fetches
const REALTIME_FETCH_LIMIT = 100; // Limit for initial fetch in real-time mode
const MAX_DISPLAY_TRADES = 100; // Max combined trades (fetched + WS) to display in real-time mode

// Loading Component
const LoadingState = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex h-[60px] flex-grow items-center justify-center bg-shadeTable px-4 sm:h-[80px]">
      <div className="flex items-center gap-2 text-fontColorPrimary">
        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
          <Image
            src="/icons/search-loading.png"
            alt="Loading Icon"
            fill
            quality={100}
            className="animate-spin object-contain"
          />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
};

const getTransactionKey = (tx: TransactionInfo): string =>
  `${tx.timestamp}-${tx.maker}-${tx.signature}`;

export default React.memo(function TradesTable({
  initData,
}: {
  initData: TokenDataMessageType | null;
}) {
  const params = useParams();
  const { remainingScreenWidth } = usePopupStore();

  // Component State
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0); // For Virtuoso height
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [walletFilter, setWalletFilter] = useState("");
  const [walletFilterTemp, setWalletFilterTemp] = useState<string>(""); // Temp state for filter modal
  const [openWalletMakerFilter, setOpenWalletMakerFilter] = useState(false);

  // Zustand Stores
  const {
    tradesDate,
    setTradesDate,
    tradesType,
    tradesValue,
    tradesTokenSol,
    tradesTotal,
    setTradesValue,
    setTradesTokenSol,
    resetFilters,
  } = useTokenCardsFilter();
  const { setTradesDateType, tradesDateType } =
    useTokenCardsFilterStorePersist();
  const setScrollOffsetValue = useTradesTableSettingStore(
    (state) => state.setScrollOffsetValue,
  );
  const transactionMessages = useTokenMessageStore(
    (state) => state.transactionMessages,
  );
  const setTransactionMessages = useTokenMessageStore(
    (state) => state.setTransactionMessages,
  );
  const developerAddress = useTokenMessageStore(
    (state) => state.dataSecurityMessage.deployer,
  );
  const {
    setFilteredWallet,
    setFilteredWalletTrades,
    resetFilteredWalletTradesState,
  } = useFilteredWalletTradesStore();
  const {
    setCurrentTokenDeveloperTradesMint,
    setCurrentTokenDeveloperTrades,
    resetCurrentTokenDeveloperTradesState,
  } = useCurrentTokenDeveloperTradesStore();
  const { selectedTableColumns } = useOpenCustomTable();

  // Derived values
  const mintOrPoolAddress = (params?.["mint-address"] ||
    params?.["pool-address"]) as string;
  const activeTradeTypes = useMemo(
    () =>
      Object.entries(tradesType)
        .filter(([_, isActive]) => isActive)
        .map(([type]) => type) as TransactionType[],
    [tradesType],
  );
  const isRealTimeMode = useMemo(
    () => !walletFilter && tradesDate === "DESC",
    [walletFilter, tradesDate],
  );

  // Reset filters on mount
  useEffect(() => {
    resetFilters();
    setScrollOffsetValue(0);
    if (mintOrPoolAddress) {
      setCurrentTokenDeveloperTradesMint(mintOrPoolAddress);
    }
    return () => {
      resetFilteredWalletTradesState();
      resetCurrentTokenDeveloperTradesState();
    };
  }, [mintOrPoolAddress]); // Re-run if address changes

  // --- Data Fetching with useQuery ---
  const queryKey = useMemo(
    () => [
      `trades-${mintOrPoolAddress}`, // Base key
      tradesDate,
      walletFilter,
      tradesTotal,
      activeTradeTypes,
      isRealTimeMode, // Include mode in key to differentiate fetch logic
    ],
    [
      mintOrPoolAddress,
      tradesDate,
      walletFilter,
      tradesTotal,
      activeTradeTypes,
      isRealTimeMode,
    ],
  );

  const {
    data: fetchedTransactions, // Renamed data for clarity
    isLoading: isLoadingTrades, // Initial load or load after filter change
    isFetching: isRefetching, // Background refetching (e.g., window focus)
    isError,
    error,
  } = useQuery({
    // Changed to useQuery
    queryKey: queryKey,
    queryFn: async () => {
      // Determine limit based on mode
      const limit = isRealTimeMode ? REALTIME_FETCH_LIMIT : TRADES_LIMIT;
      const offset = 0; // Always fetch from the beginning

      console.log(
        `Fetching trades (Mode: ${isRealTimeMode ? "Real-time" : "Filtered/Sorted"}) - Limit: ${limit}, Offset: ${offset}, Key:`,
        queryKey,
      );

      const res = await getTradesTasks({
        order: tradesDate.toLowerCase() as "asc" | "desc",
        limit: limit,
        offset: offset,
        maker: walletFilter,
        mint: mintOrPoolAddress,
        min_sol: tradesTotal.min,
        max_sol: tradesTotal.max,
        type: activeTradeTypes,
      });

      // Handle potential API error structure
      if (
        typeof res === "object" &&
        res !== null &&
        "success" in res &&
        !(res as { success: boolean }).success &&
        !Array.isArray(res)
      ) {
        console.warn("API Error fetching trades:", res);
        throw new Error("Failed to fetch trades");
      }

      return res as TransactionInfo[];
    },
    // Use initialData only if filters match the initial state AND it's real-time mode
    initialData: () => {
      const isDefaultFilterState =
        !walletFilter &&
        tradesDate === "DESC" && // Only use for default real-time view
        !tradesTotal.min &&
        !tradesTotal.max &&
        activeTradeTypes.length === 0;

      if (isDefaultFilterState && initData?.transactions) {
        // Return data directly, not the infinite query structure
        return initData.transactions;
      }
      return undefined;
    },
    enabled: !!mintOrPoolAddress, // Only fetch when address is available
    placeholderData: keepPreviousData, // Keep showing old data while refetching on filter change
    refetchOnWindowFocus: false, // Optional: disable window focus refetching
    // Removed: getNextPageParam, initialPageParam
  });

  // --- Combine Fetched Data with Real-time Messages ---
  const displayedTransactions = useMemo(() => {
    const currentFetched = fetchedTransactions ?? [];

    if (isRealTimeMode) {
      const uniqueTransactions = new Map<string, TransactionInfo>();

      // Add real-time messages first (newest)
      transactionMessages.forEach((tx) => {
        uniqueTransactions.set(getTransactionKey(tx), tx);
      });

      // Add fetched transactions (potentially older, will be overwritten by newer WS if key matches)
      currentFetched.forEach((tx) => {
        uniqueTransactions.set(getTransactionKey(tx), tx);
      });

      let combined = Array.from(uniqueTransactions.values());

      // Sort DESC (newest first) - API should already do this, but good safeguard
      combined.sort((a, b) => {
        // Handle 'first_trade' priority
        if (a.first_trade && !b.first_trade) return 1;
        if (!a.first_trade && b.first_trade) return -1;
        // Handle 'add' type priority within the same timestamp
        const isSameTimestamp = a.timestamp === b.timestamp;
        if (isSameTimestamp) {
          if (a.type === "add" && b.type !== "add") return 1; // 'add' comes first in DESC
          if (b.type === "add" && a.type !== "add") return -1;
        }
        // Primary sort by timestamp DESC
        return b.timestamp - a.timestamp;
      });

      // Limit the total number displayed
      return combined.slice(0, MAX_DISPLAY_TRADES);
    } else {
      // For ASC sort or wallet filter, use the fetched data directly.
      // The API call was already made with the correct 'order'.
      // If additional client-side sorting is strictly needed (e.g., complex rules), add it here.
      return [...currentFetched].sort((a, b) => {
        // Handle 'first_trade' priority
        if (a.first_trade && !b.first_trade) return -1;
        if (!a.first_trade && b.first_trade) return 1;
        // Handle 'add' type priority within the same timestamp
        const isSameTimestamp = a.timestamp === b.timestamp;
        if (isSameTimestamp) {
          if (a.type === "add" && b.type !== "add") return -1; // 'add' comes first in DESC
          if (b.type === "add" && a.type !== "add") return 1;
        }
        // Primary sort by timestamp DESC
        return a.timestamp - b.timestamp;
      });
    }
  }, [fetchedTransactions, transactionMessages, isRealTimeMode, tradesDate]); // Added tradesDate dependency for sorting logic

  // ### A. From Filter Trade => Mark
  useEffect(() => {
    const currentFetched = fetchedTransactions ?? [];
    if (walletFilter && currentFetched.length > 0) {
      setFilteredWallet(walletFilter);
      const walletTrades: Trade[] = currentFetched // Use currentFetched
        .filter((tx) => tx.maker === walletFilter)
        .map((tx) => ({
          average_price_sol: "",
          average_price_usd: "",
          average_sell_price_sol: "",
          average_sell_price_usd: "",
          colour: tx?.type === "buy" ? "blue" : "red",
          letter: tx?.type === "buy" ? "B" : "S",
          price: String(tx?.price ?? 0),
          price_usd: String(tx?.price_usd ?? 0),
          supply: "1000000000",
          signature: tx?.signature,
          token_amount: String(tx?.token_amount ?? 0),
          timestamp: tx?.timestamp,
          wallet: tx?.maker,
          imageUrl: `/icons/token/actions/${tx?.animal}.svg`,
        }));
      setFilteredWalletTrades(walletTrades);
    } else if (!walletFilter) {
      // Reset only if filter is cleared
      resetFilteredWalletTradesState();
      setFilteredWallet("");
    }
  }, [
    walletFilter,
    fetchedTransactions, // Depend on fetchedTransactions
    setFilteredWallet,
    setFilteredWalletTrades,
    resetFilteredWalletTradesState,
  ]);

  // ### C. From Developer Trade => Mark
  useEffect(() => {
    if (developerAddress && displayedTransactions.length > 0) {
      const developerTrades: Trade[] = displayedTransactions
        .filter((tx) => tx.is_developer && tx.maker === developerAddress)
        .map((tx) => ({
          average_price_sol: "",
          average_price_usd: "",
          average_sell_price_sol: "",
          average_sell_price_usd: "",
          colour: tx?.type === "buy" ? "green" : "red",
          letter: tx?.type === "buy" ? "DB" : "DS",
          price: String(tx?.price ?? 0),
          price_usd: String(tx?.price_usd ?? 0),
          supply: "1000000000",
          signature: tx?.signature,
          token_amount: String(tx?.token_amount ?? 0),
          timestamp: tx?.timestamp,
          wallet: tx?.maker,
        }));
      if (developerTrades.length > 0) {
        // console.log("DTM | Processed Developer Trades 🟢", developerTrades);
        setCurrentTokenDeveloperTrades(developerTrades);
      } else {
        // console.log("DTM | Processed Developer Trades 🔴", developerTrades);
      }
    } else {
      resetCurrentTokenDeveloperTradesState();
    }
  }, [
    developerAddress,
    displayedTransactions,
    setCurrentTokenDeveloperTrades,
    resetCurrentTokenDeveloperTradesState,
  ]);

  // --- Event Handlers ---
  const handleSortOrderChange = useCallback(() => {
    setTradesDate(tradesDate === "ASC" ? "DESC" : "ASC");
    // Changing tradesDate updates queryKey, useQuery handles refetch
  }, [tradesDate, setTradesDate]);

  const handleWalletFilterChange = useCallback(
    (newWalletFilter: string) => {
      setWalletFilter(newWalletFilter);
      setScrollOffsetValue(0);
      // Changing walletFilter updates queryKey, useQuery handles refetch
    },
    [setScrollOffsetValue], // Removed queryClient/queryKey dependency as it's implicit
  );

  // Removed loadMoreItems handler

  // --- Dynamic List Height ---
  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        // Add a small delay or check if height is > 0 to avoid setting 0 height initially
        // which can cause Virtuoso issues sometimes.
        const height = listRef.current.clientHeight;
        if (height > 0) {
          setListHeight(height);
        } else {
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(updateHeight, 100);
        }
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  console.log("remaining width", remainingScreenWidth);

  // --- Header Configuration ---
  // (HeaderData remains largely the same, ensure dependencies are correct)
  const HeaderData = useMemo(
    () => [
      // Date/Age Column
      {
        label: "", // No label, just buttons
        valueIdentifier: "date-age",
        sortButton: (
          <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-1">
            <button
              onClick={() => setTradesDateType("DATE")}
              className={cn(
                "inline-block cursor-pointer rounded-[12px] px-1.5 text-[10px] leading-[14px] text-fontColorPrimary duration-300",
                tradesDateType === "DATE" && "bg-white/10",
              )}
            >
              DATE
            </button>
            <button
              onClick={() => setTradesDateType("AGE")}
              className={cn(
                "inline-block cursor-pointer rounded-[12px] px-1.5 text-[10px] leading-[14px] text-fontColorPrimary duration-300",
                tradesDateType === "AGE" && "bg-white/10",
              )}
            >
              AGE
            </button>
          </div>
        ),
        sortButtonAfterTooltip: (
          <button
            onClick={handleSortOrderChange}
            className="flex cursor-pointer items-center -space-x-[7.5px]"
            title="Toggle sort order (Time)"
          >
            <HiArrowNarrowUp
              className={cn(
                "text-sm duration-300",
                tradesDate === "ASC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
            <HiArrowNarrowDown
              className={cn(
                "text-sm duration-300",
                tradesDate === "DESC"
                  ? "text-[#DF74FF]"
                  : "text-fontColorSecondary",
              )}
            />
          </button>
        ),
        tooltipContent: "The date/time the transaction was made.",
        className:
          remainingScreenWidth < 1500 ? "min-w-[120px]" : "min-w-[140px]",
      },
      // Type Column
      {
        label: "Type",
        valueIdentifier: "type",
        sortButton: <TradesTypeFilter />,
        tooltipContent: "Filter by transaction type (Buy, Sell, Add, Remove).",
        className:
          remainingScreenWidth < 1500
            ? "min-w-fit min-[1520px]:min-w-[80px] max-[1300px]:max-w-[100px]"
            : "min-w-[80px] min-[1520px]:min-w-[115px] max-[1300px]:max-w-[90px]",
      },
      // Value Column
      {
        label: "Value",
        valueIdentifier: "value",
        sortButton: (
          <SortButton
            type="usdc-or-sol"
            value={tradesValue}
            setValue={setTradesValue}
          />
        ),
        tooltipContent: "The value of the transaction in SOL/USD.",
        className:
          remainingScreenWidth < 1500
            ? "min-w-fit min-[1520px]:min-w-[120px] ml-0.5"
            : "min-w-[120px] min-[1520px]:min-w-[145px]",
      },
      // Amount Column
      {
        label: remainingScreenWidth < 1400 ? "AOT" : "Amount of tokens",
        valueIdentifier: "amount-of-tokens",
        tooltipContent: "The amount of tokens bought/sold.",
        className:
          remainingScreenWidth < 1400
            ? "min-w-fit min-[1520px]:min-w-[70px]"
            : "min-w-[145px] min-[1520px]:min-w-[150px]",
      },
      // Total SOL Column
      {
        label: remainingScreenWidth < 1400 ? "Total" : "Total SOL",
        valueIdentifier: "total",
        sortButton: (
          <>
            <TradesTotalFilter />
            <SortButton
              type="usdc-or-sol"
              value={tradesTokenSol}
              setValue={setTradesTokenSol}
            />
          </>
        ),
        tooltipContent:
          "Filter by the total value of the transaction in SOL/USD.",
        className:
          remainingScreenWidth < 1400
            ? "min-w-[115px]"
            : "min-w-[145px] min-[1520px]:min-w-[175px]",
      },
      // Maker Column
      {
        label: "Maker",
        valueIdentifier: "maker",
        tooltipContent: "Filter by maker wallet address.",
        className:
          remainingScreenWidth < 1500
            ? "min-w-[50px] min-[1520px]:min-w-[75px] justify-end ml-3"
            : "min-w-[165px] min-[1520px]:min-w-[175px] justify-end",
        sortButton: (
          <TradesMakerFilter
            openWalletMakerFilter={openWalletMakerFilter}
            setOpenWalletMakerFilter={setOpenWalletMakerFilter}
            setWalletFilter={handleWalletFilterChange} // Use the handler
            setWalletFilterTemp={setWalletFilterTemp}
            walletFilterTemp={walletFilterTemp}
          />
        ),
      },
      // Actions Column
      {
        label: "Actions",
        valueIdentifier: "actions",
        tooltipContent: "View transaction details on Solscan.",
        className:
          remainingScreenWidth < 1500
            ? "min-w-[75px] min-[1520px]:min-w-[75px] justify-end ml-3"
            : "min-w-[80px] min-[1520px]:min-w-[100px] justify-end",
      },
    ],
    [
      tradesDateType,
      setTradesDateType,
      tradesDate,
      handleSortOrderChange,
      tradesValue,
      setTradesValue,
      tradesTokenSol,
      setTradesTokenSol,
      openWalletMakerFilter,
      setOpenWalletMakerFilter,
      walletFilterTemp,
      setWalletFilterTemp,
      handleWalletFilterChange,
      remainingScreenWidth,
    ],
  );

  // --- Render Logic ---
  // Use isLoadingTrades for initial/filter loading, isRefetching for background updates
  const isLoading = isLoadingTrades;
  const setIsPaused = useTradesTableSettingStore((state) => state.setIsPaused);
  const scrollOffsetValue = useTradesTableSettingStore(
    (state) => state.scrollOffsetValue,
  );

  const addDummyDevTrade = () => {
    const mark = {
      timestamp: 1745374814733,
      colour: "red",
      letter: "DS",
      price: "0.000000064062",
      price_usd: "0.000009531837",
      token_amount: "82538461.538460999727",
      average_price_sol: "",
      average_price_usd: "",
      average_sell_price_sol: "",
      average_sell_price_usd: "",
      wallet: "FeJmhJyGuHo4dtFGT5txcNCDfw39rFYnUofPxTCkef3j",
      name: "",
      supply: "1000000000.000000000000",
      signature:
        "3sJeyjXdcWDSKQ6pM6aPrL5yMM5dWqXji6cVrcXsArNDqx2b8DujGEVtXC4C6fahqARVYnLgouw1yHzDXXmocj8x",
    };

    const now = Date.now();

    const transaction: TransactionInfo = {
      timestamp: now,
      type: Math.random() > 0.5 ? "buy" : "sell",
      value: 2811,
      value_usd: 371.67499999999995,
      token_amount: 82538461.538461,
      sol_amount: 2.5,
      sol_amount_usd: 371.67499999999995,
      price: 3.028890959925462e-8,
      price_usd: 0.000004503052190121185,
      price_str: "0.000000030",
      price_usd_str: "0.000004503",
      market_cap: 104225.10067266128,
      market_cap_usd: 104225.10067266128,
      maker: "HEbX7sam1guVfm3gqA1MNuLnrdrdUhWWjFurNPqSheky",
      signature: generateRandomSignature(),
      // signature:
      //   "2qAUYZkHPxd4uKFiKyLehAfB9EhRJXkXRyzsatTV6jd5vuhFMZS8wnEpcYNAWQc8tXxiNiHENGc8WYXx6HTsL6GL",
      buys: 2811,
      sells: 2811,
      animal: "dolphin",
      is_insider: false,
      is_sniper: false,
      is_developer: true,
      first_trade: false,
    };

    console.log("DTM | Add Dummy Dev Trade ✨", {
      now,
      transaction,
      transactionMessages,
    });

    setTransactionMessages(transaction);
  };

  return (
    <>
      <div className="relative flex h-full w-full flex-grow flex-col pb-16 md:pb-0">
        {/* Wallet filter header */}
        {walletFilter && (
          <div className="flex w-full flex-shrink-0 items-center justify-center gap-x-2 bg-secondary p-3 text-fontColorPrimary">
            {/* Show loading only when actively loading this specific filter */}
            {isLoading ? (
              <LoadingState
                text={`Loading trades for ${truncateAddress(walletFilter)}...`}
              />
            ) : (
              <>
                {/* Display count from fetchedTransactions when filtered */}
                Showing {fetchedTransactions?.length ?? 0} trades for{" "}
                {truncateAddress(walletFilter)}
                <button
                  onClick={() => handleWalletFilterChange("")} // Use handler to clear
                  className="text-primary hover:text-primary/80"
                  aria-label="Reset wallet filter"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="relative h-full w-full flex-grow">
          <div className="absolute inset-0 flex flex-col">
            {/* Table headers */}
            <div
              className={cn(
                "sticky top-0 z-[9] hidden h-[40px] min-w-max flex-shrink-0 items-center border-b border-border bg-[#080811] pl-4 pr-6 xl:flex",
                remainingScreenWidth < 1200 && "xl:hidden",
              )}
            >
              {HeaderData.map((item, index) => {
                const isActive = selectedTableColumns.find(
                  (col) => col === item.valueIdentifier,
                );
                if (!isActive) return null;
                return <HeadCol key={index} {...item} />;
              })}
            </div>

            {/* Virtualized Transaction list Container */}
            <div
              onMouseEnter={() => {
                setIsPaused(true);
              }}
              onMouseLeave={() => {
                if (scrollOffsetValue > 0) return;
                setIsPaused(false);
              }}
              ref={listRef}
              className={cn(
                "flex-grow overflow-hidden p-3 md:p-0",
                remainingScreenWidth < 1200 && "md:p-3",
              )}
            >
              {isLoading && displayedTransactions.length === 0 ? (
                // Show initial loading state only if list is empty
                <LoadingState text="Loading initial trades..." />
              ) : isError ? (
                <div className="flex h-full items-center justify-center text-red-500">
                  Error loading trades:{" "}
                  {error instanceof Error ? error.message : "Unknown error"}
                </div>
              ) : listHeight > 0 && displayedTransactions.length > 0 ? (
                // Render Virtuoso only when height is calculated and data exists
                <Virtuoso
                  style={{ height: `${listHeight}px` }} // Use calculated height
                  totalCount={displayedTransactions.length}
                  // Removed endReached prop
                  overscan={200}
                  itemContent={(index: number) => {
                    const transaction = displayedTransactions[index];
                    if (!transaction) return null;
                    return (
                      <div
                        key={`trades-card-${index}`}
                        className={cn(
                          "mb-2 xl:mb-0",
                          remainingScreenWidth < 1200 && "md:mb-2 xl:mb-2",
                        )}
                      >
                        <TradesCard
                          index={index}
                          transaction={transaction}
                          walletFilter={walletFilter}
                          setWalletFilter={handleWalletFilterChange}
                        />
                      </div>
                    );
                  }}
                  // Removed Footer component for loading more
                  components={{
                    Footer: () => {
                      // Optionally show a message if not in real-time mode and data loaded
                      if (
                        !isRealTimeMode &&
                        !isLoading &&
                        !isRefetching &&
                        displayedTransactions.length > 0
                      ) {
                        return (
                          <div className="p-4 text-center text-fontColorSecondary">
                            Showing first {displayedTransactions.length} trades.
                          </div>
                        );
                      }
                      // Optionally show background refetching indicator
                      // if (isRefetching && !isLoading) {
                      //     return <LoadingState text="Updating..." />;
                      // }
                      return null;
                    },
                  }}
                />
              ) : (
                // Handle case where loading is finished but no trades were found
                !isLoading &&
                !isRefetching &&
                displayedTransactions.length === 0 && (
                  <div className="flex h-full items-center justify-center text-fontColorSecondary">
                    No trades found matching your criteria.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <WalletTrackerModal />
    </>
  );
});

const generateRandomSignature = (length = 88): string => {
  const characters =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
