"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ChangeEvent,
} from "react";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import { useCosmoListsStore } from "@/stores/cosmo/use-cosmo-lists.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useQuery } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";
// ######## APIs 🛜 ########
import { getCosmoFilterFetch } from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import GraduatedListFilterPopover from "@/components/customs/popovers/GraduatedListFilterPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CosmoCardLoading from "@/components/customs/loadings/CosmoCardLoading";
import EmptyState from "@/components/customs/EmptyState";
// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
import { deduplicateAndPrioritizeLatestData_CosmoData } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { Input } from "@/components/ui/input";
import { useSearchFilterStore } from "@/stores/cosmo/use-search-filter.store";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { CachedImage } from "../CachedImage";
import debounce from "lodash/debounce";
import dynamic from "next/dynamic";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import VirtualizedCosmoCard from "../cards/VirtualizedCosmoCard";
import CosmoCard from "../cards/CosmoCard";
import VirtualizedContainer from "../virtualization/VirtualizedContainer";

type GraduatedListProps = {
  sizeVariant: "desktop" | "mobile";
  isListHovered: boolean;
  setIsListHovered: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
};

export default function GraduatedList({
  sizeVariant,
  isListHovered,
  setIsListHovered,
  isLoading,
}: GraduatedListProps) {
  const isCosmoTutorial = useUserInfoStore((state) => state.isCosmoTutorial);

  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );

  // Store state
  const latestMessages = useCosmoListsStore((state) => state.latestMessages);
  const graduatedChangedCount = useCosmoListsStore(
    (state) => state.graduatedChangedCount,
  );
  const graduatedList = useCosmoListsStore((state) => state.graduatedList);
  const aboutToGraduateList = useCosmoListsStore(
    (state) => state.aboutToGraduateList,
  );
  const newlyCreatedList = useCosmoListsStore(
    (state) => state.newlyCreatedList,
  );
  const mergeGraduatedPaused = useCosmoListsStore(
    (state) => state.mergeGraduatedPaused,
  );

  // Search state
  const searchTerm = useSearchFilterStore(
    (state) => state.searchTerms.graduated,
  );
  const setSearchTerm = useSearchFilterStore((state) => state.setSearchTerm);
  const updateGraduatedFiltersCount = useGraduatedFilterStore(
    (state) => state.updateGraduatedFiltersCount,
  );

  // Filter & Hovered Configuration ✨
  const filterCount = useGraduatedFilterStore(
    (state) => state.graduatedFiltersCount,
  );
  const {
    checkBoxes,
    showKeywords,
    doNotShowKeywords,
    byHoldersCount,
    byDevHoldingPercentage,
    byDevMigrated,
    bySnipers,
    byInsiderHoldingPercentage,
    byBotHolders,
    byAge,
    byCurrentLiquidity,
    byVolume,
    byMarketCap,
    byTXNS,
    byBuys,
    bySells,
  } = useGraduatedFilterStore((state) => state.filters.genuine);

  const hiddenTokens = useHiddenTokensStore((state) => state.hiddenTokens);

  const [pausedListWhenFilterApplied, setPausedListWhenFilterApplied] =
    useState<CosmoDataMessageType[]>([]);

  // Effect to merge paused lists when hover state changes
  useEffect(() => {
    if (!isListHovered) {
      const showHidden = checkBoxes.showHide;
      mergeGraduatedPaused(hiddenTokens, showHidden);

      if (pausedListWhenFilterApplied.length > 0) {
        console.log("COMSO PAUSED 🟢 - Graduated List", {
          isListHovered,
          pausedListWhenFilterApplied,
        });
        setFilterFetchListState((prev) => {
          const newUpdated = deduplicateAndPrioritizeLatestData_CosmoData([
            ...pausedListWhenFilterApplied,
            ...prev,
          ]);

          return newUpdated.filter(isListHovered ? () => true : filterTokens);
        });
        setPausedListWhenFilterApplied([]);
      }
    }
  }, [isListHovered, mergeGraduatedPaused]);

  const isFilterApplied = useMemo(() => {
    const hasMinMaxFilter = (filter: {
      min: number | undefined;
      max: number | undefined;
    }) => filter.min !== undefined || filter.max !== undefined;

    return (
      checkBoxes.moonshot === false ||
      checkBoxes.pumpfun === false ||
      checkBoxes.launchlab === false ||
      checkBoxes.dynamic_bonding_curve === false ||
      checkBoxes.raydium === false ||
      checkBoxes.meteora_dlmm === false ||
      checkBoxes.meteora_dyn === false ||
      checkBoxes.pumpswap === false ||
      checkBoxes.showHide === true ||
      showKeywords !== "" ||
      doNotShowKeywords !== "" ||
      hasMinMaxFilter(byHoldersCount) ||
      hasMinMaxFilter(byDevHoldingPercentage) ||
      hasMinMaxFilter(byDevMigrated) ||
      hasMinMaxFilter(bySnipers) ||
      hasMinMaxFilter(byInsiderHoldingPercentage) ||
      hasMinMaxFilter(byBotHolders) ||
      hasMinMaxFilter(byAge) ||
      hasMinMaxFilter(byCurrentLiquidity) ||
      hasMinMaxFilter(byVolume) ||
      hasMinMaxFilter(byMarketCap) ||
      hasMinMaxFilter(byTXNS) ||
      hasMinMaxFilter(byBuys) ||
      hasMinMaxFilter(bySells)
    );
  }, [filterCount]);

  // Filter Fetch 🛜
  const fetchCount = useRef(0);
  const [filterFetchList, setFilterFetchListState] = useState<
    CosmoDataMessageType[]
  >([]);
  const [hiddenTokenList, setHiddenTokenList] = useState<
    CosmoDataMessageType[]
  >([]);

  // Replace your custom setter with a more reliable approach
  const setFilterFetchList = useCallback((data: CosmoDataMessageType[]) => {
    setFilterFetchListState(data);
  }, []);
  const setHiddenTokenFetchList = useCallback(
    (data: CosmoDataMessageType[]) => {
      setHiddenTokenList(data);
    },
    [],
  );

  useEffect(() => {
    fetchCount.current = 0;
    setIsLoadingFilterFetch(isFilterApplied);

    return () => {
      fetchCount.current = 0;
    };
  }, []);

  // Effect to trigger refetch when filter count changes
  useEffect(() => {
    if (isFilterApplied) {
      setIsLoadingFilterFetch(true);
    }
  }, [filterCount]); // This is where we use filterCount to trigger refetches

  const isLoadingFilterFetch = useGraduatedFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetch = useGraduatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );

  const [isEmpty, setIsEmpty] = useState(false);
  const fetchFilterData = async () => {
    if (fetchCount.current === 1) return;

    fetchCount.current = 1;
    setIsEmpty(false);

    try {
      const dexes = Object.entries(checkBoxes)
        .filter(([key, value]) => value === true && key !== "showHide")
        .map(([key]) => {
          if (key === "pumpfun") {
            return "Pump.Fun";
          }
          if (key === "pumpswap") {
            return "Pump.Swap";
          }
          if (key === "launchlab") {
            return "LaunchLab";
          }
          if (key === "dynamic_bonding_curve") {
            return "Dynamic Bonding Curve";
          }
          if (key === "meteora_dlmm") {
            return "Meteora DLMM";
          }
          if (key === "meteora_dyn") {
            return "Meteora DYN";
          }
          return key
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
        })
        .join(",");

      const data = await getCosmoFilterFetch({
        column: "graduated",
        dexes: dexes.includes("Raydium")
          ? dexes
          : dexes.includes("LaunchLab")
            ? dexes + ",Raydium"
            : dexes,
        show_hidden: checkBoxes.showHide,
        show_keywords: showKeywords,
        hide_keywords: doNotShowKeywords,
        min_holders: byHoldersCount?.min,
        max_holders: byHoldersCount?.max,
        min_dev_holdings: byDevHoldingPercentage?.min,
        max_dev_holdings: byDevHoldingPercentage?.max,
        min_dev_migrated: byDevMigrated?.min,
        max_dev_migrated: byDevMigrated?.max,
        min_snipers: bySnipers?.min,
        max_snipers: bySnipers?.max,
        min_insider_holding: byInsiderHoldingPercentage?.min,
        max_insider_holding: byInsiderHoldingPercentage?.max,
        min_bot_holders: byBotHolders?.min,
        max_bot_holders: byBotHolders?.max,
        min_age: byAge?.min,
        max_age: byAge?.max,
        min_liquidity: byCurrentLiquidity?.min,
        max_liquidity: byCurrentLiquidity?.max,
        min_market_cap: byMarketCap?.min,
        max_market_cap: byMarketCap?.max,
        min_volume: byVolume?.min,
        max_volume: byVolume?.max,
        min_transactions: byTXNS?.min,
        max_transactions: byTXNS?.max,
        min_buys: byBuys?.min,
        max_buys: byBuys?.max,
        min_sells: bySells?.min,
        max_sells: bySells?.max,
      });

      if (data?.graduated && data?.graduated.length > 0) {
        setFilterFetchList(data?.graduated);
        setHiddenTokenFetchList(data?.graduated);

        // If this is a reset, also update the main list
        if (!isFilterApplied) {
          useCosmoListsStore.getState().setGraduatedList(data.graduated);
        }

        return data?.graduated;
      } else {
        setIsEmpty(true);
        setFilterFetchList([]);
        setHiddenTokenFetchList([]);
        fetchCount.current = 0;
        return [];
      }
    } catch (error) {
      console.warn("Error fetching filter data:", error);
      setFilterFetchList([]);
      setHiddenTokenFetchList([]);
      fetchCount.current = 0;
      return [];
    } finally {
      setIsLoadingFilterFetch(false);
      fetchCount.current = 0;
    }
  };

  useQuery({
    queryKey: ["cosmoFilterFetchGraduated", filterCount], // Add filterCount to the query key
    queryFn: fetchFilterData,
    enabled: isLoadingFilterFetch && fetchCount.current === 0,
  });

  // Filters 🔍
  const filterTokens = useCallback(
    (data: CosmoDataMessageType) => {
      if (
        data.dex === "Pump.Fun" ||
        data.dex === "Moonshot" ||
        data.dex === "LaunchLab" ||
        data.dex === "Dynamic Bonding Curve"
      ) {
        return false;
      }

      // ### DEX FILTER
      const transformedOriginDex = data?.origin_dex
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();
      const transformedDex = data?.dex
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();

      // console.log("DEXES | Transformed Dex ✨", {
      //   checkBoxes,
      //   origin_dex: data?.origin_dex,
      //   transformedOriginDex,
      //   dex: data?.dex,
      //   transformedDex,
      // });

      if (
        !(
          (transformedOriginDex &&
            checkBoxes[transformedOriginDex as keyof typeof checkBoxes]) ||
          (transformedDex &&
            checkBoxes[transformedDex as keyof typeof checkBoxes])
        )
      ) {
        return false;
      }

      // ### KEYWORDS FILTER
      if (showKeywords) {
        const keywords = showKeywords
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText = `${data.name} ${data.symbol}`.toLowerCase();
        if (!keywords.some((keyword) => tokenText.includes(keyword)))
          return false;
      }

      if (doNotShowKeywords) {
        const keywords = doNotShowKeywords
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText = `${data.name} ${data.symbol}`.toLowerCase();
        if (keywords.some((keyword) => tokenText.includes(keyword)))
          return false;
      }

      // ### AMOUNT FILTER
      // 1. Holders Count Filter
      const holdersCount = Number(data.holders) || 0;
      if (byHoldersCount.min && holdersCount < byHoldersCount.min) return false;
      if (byHoldersCount.max && holdersCount > byHoldersCount.max) return false;

      // 2. Dev Holdings Filter
      const devHoldingsPercent = Number(data.dev_holding_percentage) || 0;
      if (
        byDevHoldingPercentage.min &&
        devHoldingsPercent < byDevHoldingPercentage.min
      )
        return false;
      if (
        byDevHoldingPercentage.max &&
        devHoldingsPercent > byDevHoldingPercentage.max
      )
        return false;

      // 3. Dev Migrated Filter
      const devMigrated = Number(data.snipers) || 0;
      if (byDevMigrated.min && devMigrated < byDevMigrated.min) return false;
      if (byDevMigrated.max && devMigrated > byDevMigrated.max) return false;

      // 4. Snipers Filter
      const snipers = Number(data.snipers) || 0;
      if (bySnipers.min && snipers < bySnipers.min) return false;
      if (bySnipers.max && snipers > bySnipers.max) return false;

      // 5. Insider Holding Filter
      const insiderHoldingsPercent = Number(data.insider_percentage) || 0;
      if (
        byInsiderHoldingPercentage.min &&
        insiderHoldingsPercent < byInsiderHoldingPercentage.min
      )
        return false;
      if (
        byInsiderHoldingPercentage.max &&
        insiderHoldingsPercent > byInsiderHoldingPercentage.max
      )
        return false;

      // 6. Bot Holders Filter
      const botHolders = Number(data.bot_holders) || 0;
      if (byBotHolders.min && botHolders < byBotHolders.min) return false;
      if (byBotHolders.max && botHolders > byBotHolders.max) return false;

      // 7. Age Filter (Mins)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const migratedTime =
        data.created > 1e12 // Check if timestamp is in ms
          ? Math.floor(data.migrated_time / 1000) // Convert ms to s if needed
          : Number(data.migrated_time) || 0; // Keep as seconds

      const ageInMinutes = (now - migratedTime) / 60;

      // console.log("AGE IN MINUTES ⏳", {
      //   now,
      //   migratedTime,
      //   ageInMinutes,
      //   range: {
      //     min: byAge.min,
      //     max: byAge.max,
      //   },
      // });

      if (byAge.min && ageInMinutes < byAge.min) return false;
      if (byAge.max && ageInMinutes > byAge.max) return false;

      // 8. Current Liquidity Filter
      const currentLiquidity = Number(data.liquidity_usd) || 0;
      if (byCurrentLiquidity.min && currentLiquidity < byCurrentLiquidity.min)
        return false;
      if (byCurrentLiquidity.max && currentLiquidity > byCurrentLiquidity.max)
        return false;

      // 9. Volume Filter
      const volumeValue = Number(data.volume_usd) || 0;
      if (byVolume.min && volumeValue < byVolume.min) return false;
      if (byVolume.max && volumeValue > byVolume.max) return false;

      // 10. Market Cap Filter
      const marketCap = Number(data.market_cap_usd) || 0;
      if (byMarketCap.min && marketCap < byMarketCap.min) return false;
      if (byMarketCap.max && marketCap > byMarketCap.max) return false;

      // 11. TXNS Filter
      const TXNS = (Number(data.buys) || 0) + (Number(data.sells) || 0);
      if (byTXNS.min && TXNS < byTXNS.min) return false;
      if (byTXNS.max && TXNS > byTXNS.max) return false;

      // 12. Buys Filter
      const buys = Number(data.buys) || 0;
      if (byBuys.min && buys < byBuys.min) return false;
      if (byBuys.max && buys > byBuys.max) return false;

      // 13. Sells Filter
      const sells = Number(data.sells) || 0;
      if (bySells.min && sells < bySells.min) return false;
      if (bySells.max && sells > bySells.max) return false;

      return true;
    },
    [filterCount],
  );

  // Effect to update filtered data
  useEffect(() => {
    if (isFilterApplied) {
      if (isListHovered) {
        setFilterFetchListState((prev) => {
          const relevantLatestMessages = latestMessages.filter(
            isListHovered ? () => true : filterTokens,
          );

          const updatesForExisting = [
            ...relevantLatestMessages,
            ...aboutToGraduateList.filter((m) => m.type === "update"),
            ...newlyCreatedList.filter((m) => m.type === "update"),
          ].filter((latest) =>
            prev.some((existing) => existing.mint === latest.mint),
          );

          const newItemsToPause = relevantLatestMessages.filter(
            (latest) => !prev.some((existing) => existing.mint === latest.mint),
          );

          if (newItemsToPause.length > 0) {
            setPausedListWhenFilterApplied((prevPaused) =>
              deduplicateAndPrioritizeLatestData_CosmoData([
                ...prevPaused,
                ...newItemsToPause,
              ]),
            );
          }

          const updatedList = deduplicateAndPrioritizeLatestData_CosmoData([
            ...prev,
            ...updatesForExisting,
          ]);

          return updatedList.filter(isListHovered ? () => true : filterTokens);
        });
      } else {
        setFilterFetchListState((prev) => {
          const newUpdated = deduplicateAndPrioritizeLatestData_CosmoData([
            ...graduatedList,
            ...latestMessages,
            ...prev,
          ]);

          return newUpdated.filter(isListHovered ? () => true : filterTokens);
        });
      }
    } else {
      if (filterFetchList.length > 0) {
        setFilterFetchListState([]);
      }
    }

    if (checkBoxes.showHide) {
      setHiddenTokenList((prev) => {
        const newUpdated = deduplicateAndPrioritizeLatestData_CosmoData([
          ...graduatedList,
          ...latestMessages,
          ...prev,
        ]);

        return newUpdated
          .filter(isListHovered ? () => true : filterTokens)
          .filter((item) => hiddenTokens.some((token) => token === item.mint));
      });
    } else {
      if (filterFetchList.length > 0) {
        setHiddenTokenList([]);
      }
    }
  }, [
    graduatedChangedCount,
    isFilterApplied,
    filterTokens,
    filterCount,
    latestMessages,
    isListHovered,
    checkBoxes.showHide,
    hiddenTokens,
  ]);

  const filteredItems = useMemo(() => {
    // if (
    //   isLoading ||
    //   // isNewUser ||
    //   isLoadingFilterFetch
    // ) {
    //   return [];
    // }

    const sourceList = isFilterApplied
      ? checkBoxes.showHide
        ? hiddenTokenList
        : filterFetchList
      : graduatedList;

    // First apply the regular filters
    let filtered = sourceList.filter(isListHovered ? () => true : filterTokens);

    // Apply hidden tokens filter
    if (checkBoxes.showHide) {
      // Only show hidden tokens
      filtered = filtered.filter((item) => hiddenTokens.includes(item.mint));
    } else {
      // Hide the hidden tokens
      filtered = filtered.filter((item) => !hiddenTokens.includes(item.mint));
    }

    // Then apply search filtering if a search term exists
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedSearchTerm) ||
          item.symbol.toLowerCase().includes(lowercasedSearchTerm) ||
          (item.developer &&
            item.developer.toLowerCase().includes(lowercasedSearchTerm)),
      );
    }

    // Finally apply the same sorting as before
    return filtered
      .sort((a, b) => {
        const timestampA = BigInt(Number(a.migrated_time));
        const timestampB = BigInt(Number(b.migrated_time));
        return Number(timestampB - timestampA);
      })
      .slice(0, 30);
  }, [
    // isLoading,
    // isNewUser,
    // isLoadingFilterFetch,
    isFilterApplied,
    isEmpty,
    filterFetchList,
    graduatedList,
    filterTokens,
    searchTerm,
    checkBoxes.showHide,
    hiddenTokens,
  ]);

  // ########## Search Functionality 🔍 ###########
  const setPreviewSearch = useGraduatedFilterStore((s) => s.setPreviewSearch);
  const previewSearchValue = useGraduatedFilterStore(
    (s) => s.filters.preview.showKeywords,
  );
  const applyFilter = useGraduatedFilterStore((s) => s.applyGraduatedFilters);
  const debouncedSetGenuineSearch = useCallback(
    debounce(async () => {
      setIsLoadingFilterFetch(true);
      applyFilter();
      updateGraduatedFiltersCount();
    }, 300),
    [applyFilter],
  );
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    debouncedSetGenuineSearch();
    setPreviewSearch(query);
  };

  useEffect(() => {
    return () => {
      debouncedSetGenuineSearch.cancel();
    };
  }, [debouncedSetGenuineSearch]);

  // const renderItem = useCallback(
  //   (index: number) => {
  //     if (isLoading || isLoadingFilterFetch) {
  //       return <CosmoCardLoading />;
  //     }

  //     return (
  //       <CosmoCard
  //         isFirst={index === 0}
  //         data={filteredItems[index]}
  //         column={3}
  //       />
  //     );
  //   },
  //   [isLoading, isLoadingFilterFetch, filteredItems, sizeVariant],
  // );

  // const commonListContent = useMemo(
  //   () => (
  //     <>
  //       {filteredItems.length > 0 || isLoading || isLoadingFilterFetch ? (
  //         <VirtualizedContainer
  //           items={filteredItems}
  //           itemContent={renderItem}
  //           totalCount={
  //             isLoading || isLoadingFilterFetch ? 15 : filteredItems.length
  //           }
  //         />
  //       ) : (
  //         <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
  //           <EmptyState
  //             state={isFilterApplied ? "Cosmo No Result" : "Cosmo Empty"}
  //           />
  //         </div>
  //       )}
  //     </>
  //   ),
  //   [
  //     filteredItems,
  //     isLoading,
  //     isLoadingFilterFetch,
  //     isFilterApplied,
  //     renderItem,
  //   ],
  // );

  return (
    <>
      {sizeVariant === "desktop" && (
        <div className="relative col-span-1 flex w-full flex-grow flex-col">
          <div className="flex w-full items-center justify-between py-4">
            <div className="flex items-center gap-x-2">
              <div className="flex flex-shrink-0 items-center gap-x-1.5">
                <h3 className="font-geistSemiBold text-base text-fontColorPrimary">
                  Graduated
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                        <CachedImage
                          src="/icons/info-tooltip.png"
                          alt="Info Tooltip Icon"
                          fill
                          quality={50}
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tokens which have bonded</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {isListHovered && !isCosmoTutorial && (
                <>
                  <Separator
                    color="#202037"
                    orientation="vertical"
                    unit="fixed"
                    fixedHeight={24}
                  />

                  <div className="flex h-[24px] items-center gap-x-0.5 rounded-[4px] bg-success/20 px-1.5">
                    <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                      <Image
                        src="/icons/paused.png"
                        alt="Pause Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span
                      className={cn(
                        "hidden font-geistRegular text-sm text-success min-[1650px]:inline-block",
                        remainingScreenWidth <= 1440 && "min-[1650px]:hidden",
                      )}
                    >
                      Paused
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-x-2">
              <div
                className={cn(
                  "relative h-6 max-w-40",
                  remainingScreenWidth <= 1440 && "hidden",
                )}
              >
                <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
                  <Image
                    src="/icons/search-input.png"
                    alt="Search Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <Input
                  placeholder="Search tokens..."
                  className="h-6 pl-8"
                  value={previewSearchValue}
                  onChange={handleSearchChange}
                />
              </div>

              <GraduatedListFilterPopover />
            </div>
          </div>

          <div
            onMouseEnter={() => {
              // if (isLoading || isNewUser) return;
              if (isLoading) return;
              setIsListHovered(true);
            }}
            onMouseLeave={() => setIsListHovered(false)}
            className="nova-scroller relative w-full flex-grow"
          >
            {/* {filteredItems.length > 0 || isLoading || isLoadingFilterFetch ? (
              <Virtuoso
                style={
                  isCosmoTutorial
                    ? {
                        overflow: "hidden",
                      }
                    : {
                        overflowY: "scroll",
                      }
                }
                increaseViewportBy={1000}
                totalCount={
                  isLoading ||
                  // isNewUser ||
                  isLoadingFilterFetch
                    ? 30
                    : filteredItems.length
                }
                itemContent={(index) => <VirtualizedCosmoCard index={index} filteredItems={filteredItems} isLoading={isLoading || isLoadingFilterFetch} sizeVariant={sizeVariant} />}
              />
            ) : (
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                <EmptyState
                  state={isFilterApplied ? "Cosmo No Result" : "Cosmo Empty"}
                />
              </div>
            )} */}

            {isLoading || isLoadingFilterFetch ? (
              <div className="absolute left-0 top-0 h-full w-full">
                {Array.from({ length: 30 }).map((_, index) => (
                  <CosmoCardLoading key={index} />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="absolute left-0 top-0 h-full w-full">
                {filteredItems.map((item, index) => (
                  <CosmoCard
                    key={item?.mint}
                    isFirst={index === 0}
                    data={item}
                    column={3}
                  />
                ))}
              </div>
            ) : (
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                <EmptyState
                  state={isFilterApplied ? "Cosmo No Result" : "Cosmo Empty"}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {sizeVariant === "mobile" && (
        <div className="flex h-full w-full flex-col pl-4 pr-2 pt-3 lg:pl-0">
          <div className="nova-scroller relative w-full flex-grow">
            {/* {commonListContent} */}

            {isLoading || isLoadingFilterFetch ? (
              <div className="absolute left-0 top-0 h-full w-full">
                {Array.from({ length: 15 }).map((_, index) => (
                  <CosmoCardLoading key={index} />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="absolute left-0 top-0 h-full w-full">
                {filteredItems.map((item, index) => (
                  <CosmoCard
                    key={item?.mint}
                    isFirst={index === 0}
                    data={item}
                    column={1}
                  />
                ))}
              </div>
            ) : (
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                <EmptyState
                  state={isFilterApplied ? "Cosmo No Result" : "Cosmo Empty"}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
