"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useHoldingsSearchStore } from "@/stores/holdings/use-holdings-search.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useQuery } from "@tanstack/react-query";
import { usePopupStore } from "@/stores/use-popup-state";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import { getHoldings } from "@/apis/rest/holdings";
// ######## Components 🧩 ########
import HoldingsTable from "@/components/customs/tables/HoldingsTable";
import HoldingsListMobile from "@/components/customs/lists/mobile/HoldingsListMobile";
import EmptyState from "@/components/customs/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import HoldingsCardLoading from "@/components/customs/loadings/HoldingsCardLoading";
import HoldingsCardMobileLoading from "@/components/customs/loadings/HoldingsCardMobileLoading";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

// ######## Types 🗨️ ########
import { getWallets, Wallet } from "@/apis/rest/wallet-manager";
import {
  HoldingsTransformedTokenData,
  HoldingsConvertedMessageType,
  HoldingsTokenData,
} from "@/types/ws-general";
import { ChartPrice } from "@/types/nova_tv.types";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
// ######## Constants ☑️ ########
import {
  HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
  HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
} from "@/constants/duration";
import { dummyfilteredTokenBasedOnSelectedWalletData } from "@/constants/dummy-data";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useWebsocketMonitor } from "@/stores/use-websocket-monitor.store";
import { useWebsocket } from "@/hooks/use-websocket";

type HoldingsDataQueuedMessage = {
  data: HoldingsConvertedMessageType | HoldingsConvertedMessageType[];
  timestamp: number;
};
type HoldingsChartPriceDataQueuedMessage = {
  data: ChartPrice;
  timestamp: number;
};

const findMissingMints = (
  currentMints: string[],
  allMints: string[],
): string[] => {
  // Create a Set from current mints for O(1) lookup
  const currentMintsSet = new Set(currentMints);

  // Filter allMints to find ones not in currentMints
  return allMints.filter((mint) => !currentMintsSet.has(mint));
};
export default function HoldingsListSection() {
  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );

  // const holdingsMessagesTimestamp = useHoldingsMessageStore(
  //   (state) => state.timestamp,
  // );
  // const setWSChartHoldingRef = useHoldingsMessageStore(
  //   (state) => state.setWSChartHoldingRef,
  // );
  const listSubscribedMints = useHoldingsMessageStore(
    (state) => state.listSubscribedMints,
  );
  const listAllMints = useHoldingsMessageStore((state) => state.listAllMints);
  const setListAllMints = useHoldingsMessageStore(
    (state) => state.setListAllMints,
  );
  const setListSubscribedMints = useHoldingsMessageStore(
    (state) => state.setListSubscribedMints,
  );
  const updateHoldingsMessages = useHoldingsMessageStore(
    (state) => state.updateMessage,
  );
  const setHoldingsMessages = useHoldingsMessageStore(
    (state) => state.setMessages,
  );
  const setChartPriceMessage = useHoldingsMessageStore(
    (state) => state.setChartPriceMessage,
  );
  // const chartPriceMessage = useHoldingsMessageStore(
  //   (state) => state.chartPriceMessage,
  // );

  // # Throttle 🏍️
  // const throttledUpdateHoldingsMessages = useRef(
  //   throttle(updateHoldingsMessages, 250),
  // ).current;
  // const throttledSetChartPriceMessage = useRef(
  //   throttle(setChartPriceMessage, 250),
  // ).current;

  // ### Batch Processing ✨
  const holdingsDataMessageQueueRef = useRef<HoldingsDataQueuedMessage[]>([]);
  const holdingsDataProcessingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chartPriceHoldingsDataMessageQueueRef = useRef<
    HoldingsChartPriceDataQueuedMessage[]
  >([]);
  const chartPriceHoldingsDataProcessingTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  const processHoldingsDataMessageQueue = () => {
    const currentQueue = [...holdingsDataMessageQueueRef.current];
    holdingsDataMessageQueueRef.current = [];

    currentQueue.forEach(({ data }) => {
      updateHoldingsMessages(data);
    });
  };
  const processChartPriceHoldingsDataMessageQueue = () => {
    const currentQueue = [...chartPriceHoldingsDataMessageQueueRef.current];
    chartPriceHoldingsDataMessageQueueRef.current = [];

    currentQueue.forEach(({ data }) => {
      setChartPriceMessage(data);
    });
  };

  // console.log("chartPriceMessage❤️❤️", chartPriceMessage);
  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  // console.log("HOLDINGS MESSAGES🧑‍🤝‍🧑", holdingsMessages);
  const isLoading = useHoldingsMessageStore((state) => state.isLoading);
  const { hiddenTokenList, isShowHiddenToken } = useHoldingsHideStore();
  const searchQuery = useHoldingsSearchStore((state) => state.searchQuery);
  const selectedMultipleActiveWalletHoldings = useUserWalletStore(
    (state) => state.selectedMultipleActiveWalletHoldings,
  );

  const withRemainingTokens = useHoldingsFilterStore(
    (state) => state.filters.genuine.withRemainingTokens,
  );

  const {
    data: initHoldings,
    isLoading: isLoadingFetch,
    isSuccess: isSuccessInit,
  } = useQuery({
    queryKey: ["init-holdings"],
    queryFn: async () => {
      const data = await getHoldings();
      if (data) {
        setHoldingsMessages(data);
        setListAllMints(
          data
            ?.flatMap(
              (holding) =>
                holding.tokens?.map((token) => token.token.mint) || [],
            )
            ?.filter(Boolean) || [],
        );
      }
      return data;
    },
  });

  const finalHoldings = useMemo(() => {
    const holdings = (
      holdingsMessages.length > 0 &&
      holdingsMessages.length >= (initHoldings?.length as number)
        ? holdingsMessages
        : initHoldings
    ) as HoldingsConvertedMessageType[];

    return holdings;
  }, [
    holdingsMessages,
    initHoldings,
    isLoadingFetch,
    isSuccessInit,
    isHoldingsTutorial,
  ]);

  const tokenFilter = useCallback(
    (
      t: HoldingsTokenData,
      searchQuery: string,
      isShowHiddenToken: boolean,
      hiddenTokenList: string[],
      withRemainingTokens: boolean,
    ) => {
      const isHidden =
        !isShowHiddenToken && hiddenTokenList.includes(t.token.mint);

      if (searchQuery.trim()) {
        const keywords = searchQuery
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText = `${t.token.name} ${t.token.symbol}`.toLowerCase();
        if (!keywords.some((keyword) => tokenText.includes(keyword))) {
          return false;
        }
      }

      const remaining = (t.balance / (t.balance + t.soldTokens)) * 100;
      if (withRemainingTokens) {
        return !isHidden && remaining > 0;
      }

      return !isHidden;
    },
    [isShowHiddenToken, hiddenTokenList, searchQuery, withRemainingTokens],
  );

  // Get wallets
  const {
    data: walletsFetch,
    isLoading: isLoadingWallet,
    isFetched,
    isSuccess,
  } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await getWallets();
      return res;
    },
  });

  const finalWallets =
    selectedMultipleActiveWalletHoldings.length > 0
      ? selectedMultipleActiveWalletHoldings
      : (walletsFetch as Wallet[]);

  // ### With State ✨
  // const [dataList, setDataList] = useState<HoldingsTransformedTokenData[]>([]);
  // useEffect(() => {
  //   setDataList((prevDataList) => {
  //     const dataMap = new Map(
  //       prevDataList.map((item) => [item.token.mint, item]),
  //     );

  //     finalWallets?.forEach((wallet) => {
  //       const walletHoldings = finalHoldings?.find(
  //         (holding) => holding.wallet === wallet.address,
  //       );

  //       if (walletHoldings) {
  //         walletHoldings.tokens
  //           ?.filter((token) => token.investedSol > 0)
  //           .forEach((tokenHolding) => {
  //             if (dataMap.has(tokenHolding.token.mint)) {
  //               // Update existing token entry
  //               const existingToken = dataMap.get(tokenHolding.token.mint)!;
  //               const walletEntry = existingToken.list.find(
  //                 (entry) => entry.wallet === wallet.address,
  //               );

  //               if (walletEntry) {
  //                 walletEntry.token = { ...tokenHolding }; // Update existing wallet entry
  //               } else {
  //                 existingToken.list.push({
  //                   wallet: wallet.address,
  //                   token: { ...tokenHolding },
  //                 });
  //               }
  //             } else {
  //               // Add new token entry
  //               dataMap.set(tokenHolding.token.mint, {
  //                 token: tokenHolding.token,
  //                 list: [
  //                   { wallet: wallet.address, token: { ...tokenHolding } },
  //                 ],
  //               });
  //             }
  //           });
  //       }
  //     });

  //     return Array.from(dataMap.values());
  //   });
  // }, [
  //   finalWallets,
  //   finalHoldings,
  //   initHoldings,
  //   holdingsMessages,
  //   isShowHiddenToken,
  //   hiddenTokenList,
  //   isLoading,
  //   walletsFetch,
  //   isFetched,
  //   isSuccess,
  // ]);

  // const [
  //   filteredTokenBasedOnSelectedWallet,
  //   setFilteredTokenBasedOnSelectedWallet,
  // ] = useState<HoldingsTransformedTokenData[]>([]);
  // useEffect(() => {
  //   // Filter tokens based on selected wallets
  //   const selectedWalletString = finalWallets?.map((wallet) => wallet.address);
  //   setFilteredTokenBasedOnSelectedWallet((prevFiltered) => {
  //     const filtered = dataList
  //       .map((tokenData) => ({
  //         token: tokenData.token,
  //         list: tokenData.list.filter(
  //           (t) =>
  //             selectedWalletString.includes(t.wallet) &&
  //             t.token.investedSol > 0,
  //         ),
  //       }))
  //       .map((tokenData) => ({
  //         token: tokenData.token,
  //         list: tokenData.list.filter((entry) => {
  //           const tokenDataForFilter: HoldingsTokenData = {
  //             token: tokenData.token,
  //             ...entry.token,
  //           };
  //           return tokenFilter(
  //             tokenDataForFilter,
  //             searchQuery,
  //             isShowHiddenToken,
  //             hiddenTokenList,
  //             withRemainingTokens,
  //           );
  //         }),
  //       }))
  //       .filter(
  //         (tokenData) => tokenData.list.length > 0,
  //       ) as HoldingsTransformedTokenData[];

  //     filtered.sort((a, b) => {
  //       const lastBoughtA = Math.max(
  //         ...a.list.map((item) => item.token.lastBought || 0),
  //       );
  //       const lastBoughtB = Math.max(
  //         ...b.list.map((item) => item.token.lastBought || 0),
  //       );
  //       return lastBoughtA - lastBoughtB;
  //     });

  //     return filtered;
  //   });
  // }, [dataList, withRemainingTokens]);

  // ### With Memoized State ✨
  // Replace the useState/useEffect for dataList with this:
  const dataList = useMemo(() => {
    const dataMap = new Map<string, HoldingsTransformedTokenData>();

    finalWallets?.forEach((wallet) => {
      const walletHoldings = finalHoldings?.find(
        (holding) => holding.wallet === wallet.address,
      );

      if (walletHoldings) {
        walletHoldings.tokens
          ?.filter((token) => token.investedSol > 0) // Keep this initial filter if desired
          .forEach((tokenHolding) => {
            const mint = tokenHolding.token.mint;
            if (dataMap.has(mint)) {
              const existingToken = dataMap.get(mint)!;
              const walletEntryIndex = existingToken.list.findIndex(
                (entry) => entry.wallet === wallet.address,
              );
              if (walletEntryIndex > -1) {
                // Update existing wallet entry immutably
                // @ts-ignore
                existingToken.list = [
                  ...existingToken.list.slice(0, walletEntryIndex),
                  { wallet: wallet.address, token: { ...tokenHolding } },
                  ...existingToken.list.slice(walletEntryIndex + 1),
                ];
              } else {
                existingToken.list.push({
                  wallet: wallet.address,
                  token: { ...tokenHolding },
                });
              }
            } else {
              dataMap.set(mint, {
                token: tokenHolding.token,
                list: [{ wallet: wallet.address, token: { ...tokenHolding } }],
              });
            }
          });
      }
    });

    return Array.from(dataMap.values());
  }, [
    finalWallets,
    finalHoldings,
    initHoldings,
    holdingsMessages,
    isShowHiddenToken,
    hiddenTokenList,
    isLoading,
    walletsFetch,
    isFetched,
    isSuccess,
  ]);

  const filteredTokenBasedOnSelectedWallet = useMemo(() => {
    const selectedWalletString =
      finalWallets?.map((wallet) => wallet.address) || [];

    const filtered = dataList
      .map((tokenData) => ({
        token: tokenData.token,
        list: tokenData.list.filter(
          (t) =>
            selectedWalletString.includes(t.wallet) && t.token.investedSol > 0,
        ),
      }))
      .map((tokenData) => ({
        token: tokenData.token,
        list: tokenData.list.filter((entry) => {
          const tokenDataForFilter: HoldingsTokenData = {
            token: tokenData.token,
            ...entry.token,
          };

          return tokenFilter(
            tokenDataForFilter,
            searchQuery,
            isShowHiddenToken,
            hiddenTokenList,
            withRemainingTokens,
          );
        }),
      }))
      .filter((tokenData) => tokenData.list.length > 0);

    filtered.sort((a, b) => {
      const lastBoughtA = Math.max(
        ...a.list.map((item) => item.token.lastBought || 0),
      );
      const lastBoughtB = Math.max(
        ...b.list.map((item) => item.token.lastBought || 0),
      );
      return lastBoughtB - lastBoughtA;
    });

    return filtered as HoldingsTransformedTokenData[];
  }, [
    dataList,
    finalWallets,
    searchQuery,
    isShowHiddenToken,
    hiddenTokenList,
    withRemainingTokens,
    tokenFilter,
  ]);

  const finalLoading = isLoadingWallet || isLoading || isLoadingFetch;
  const width = useWindowSizeStore((state) => state.width);

  // ########## WebSocket⌛ ##########
  // const WSChartHoldingRef = useRef<WebSocket | null>(null);
  // const isWSMounted = useRef(true);

  useEffect(() => {
    const missingSubscribedMints = findMissingMints(
      listSubscribedMints,
      listAllMints,
    );

    if (missingSubscribedMints.length == 0) return;
    handleSendMessage(missingSubscribedMints);
  }, [listSubscribedMints, listAllMints]);
  // }, [listSubscribedMints, listAllMints, WSChartHoldingRef?.current]);

  const handleSendMessage = (mints: string[]) => {
    // if (
    //   !WSChartHoldingRef.current ||
    //   WSChartHoldingRef.current.readyState !== WebSocket.OPEN
    // ) {
    //   return;
    // }

    try {
      const subscriptionMessage = [
        ...mints
          .map((mint) => [
            {
              token: cookies.get("_nova_session"),
              channel: "chartHoldings",
              mint,
              method: "holdings",
            },
            {
              token: cookies.get("_nova_session"),
              channel: "chartPrice",
              mint,
              method: "holdings",
            },
          ])
          .flat(),
      ];
      setListSubscribedMints([...listSubscribedMints, ...mints]);
      send(JSON.stringify(subscriptionMessage));
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  // const allWSPingInterval = useRef<NodeJS.Timeout | null>(null);
  // const allWSPingTimeout = useRef<NodeJS.Timeout | null>(null);
  // const allWSLastPingTimestamp = useRef<number>();
  // const allWSConnectedStatus = useRef<boolean>(false);
  // const allWSIsConnecting = useRef<boolean>(false);
  // let reconnectAttempts = 0;

  const { addError } = useWebsocketMonitor();

  const { send, disconnect } = useWebsocket({
    name: "holding",
    url: String(getWSBaseURLBasedOnRegion()),
    onopen: () => {
      holdingsDataProcessingTimerRef.current = setInterval(
        processHoldingsDataMessageQueue,
        HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
      );
      chartPriceHoldingsDataProcessingTimerRef.current = setInterval(
        processChartPriceHoldingsDataMessageQueue,
        HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onmessage: (event) => {
      try {
        if (
          event.data.includes(`"success":true,"channel"`) ||
          event.data.includes("Ping")
        ) {
          return;
        }

        let newMessage = JSON.parse(event.data);
        if (
          newMessage?.data?.wallet ||
          newMessage?.channel == "chartHoldings"
        ) {
          const prevHoldingWallet = holdingsDataMessageQueueRef.current.find(
            (item) =>
              (item.data as HoldingsConvertedMessageType).wallet ===
              newMessage?.data?.wallet,
          );
          const prevToken = (
            prevHoldingWallet?.data as HoldingsConvertedMessageType
          )?.tokens?.find(
            (item) => item.token.mint === newMessage?.data?.holding.token.mint,
          );
          if (
            newMessage?.data.holding.investedSol == 0 ||
            (prevToken?.balance === newMessage?.data?.holding.balance &&
              prevToken?.soldSol !== newMessage?.data?.holding.soldSol &&
              !(
                prevToken?.balance !== newMessage?.data?.holding.balance &&
                prevToken?.soldSol !== newMessage?.data?.holding.soldSol
              ))
          )
            return;
          holdingsDataMessageQueueRef.current.push({
            data: {
              wallet: newMessage?.data?.wallet,
              tokens: [newMessage?.data?.holding],
            },
            timestamp: Date.now(),
          });
          return;
        } else if (newMessage?.mint && newMessage?.price) {
          chartPriceHoldingsDataMessageQueueRef.current.push({
            data: newMessage,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.warn("Error parsing message:", e);
        addError("holding", {
          message: (e as any).message || "Error parsing message",
          timestamp: new Date(),
        });
      }
    },
  });

  // const connectHoldingsWebSocket = (
  //   type: "mint" | "chartHoldings" | "all" = "all",
  // ) => {
  //   const token = cookies.get("_nova_session");
  //   if (!token || token === "") return;
  //
  //   try {
  //     const ws = new WebSocket(String(getWSBaseURLBasedOnRegion()));
  //     WSChartHoldingRef.current = ws;
  //     setWSChartHoldingRef(ws);
  //
  //     setWebsocketState("holding", {
  //       status: "connecting",
  //     });
  //
  //     ws.onopen = () => {
  //       if (!isWSMounted.current) return;
  //       setWebsocketState("holding", {
  //         connectedTimestamp: new Date(),
  //         status: "connected",
  //         retryCount: 0,
  //       });
  //
  //       reconnectAttempts = 0;
  //       console.log("CHART HOLDINGS - CONNECTED ✅");
  //       allWSIsConnecting.current = false;
  //       allWSConnectedStatus.current = true;
  //       allWSLastPingTimestamp.current = Date.now();
  //
  //       if (allWSPingInterval.current) {
  //         clearInterval(allWSPingInterval.current);
  //       }
  //
  //       allWSPingInterval.current = setInterval(() => {
  //         if (allWSConnectedStatus.current) {
  //           const now = Date.now();
  //
  //           if (now - allWSLastPingTimestamp.current! > 4000) {
  //             allWSConnectedStatus.current = false;
  //             allWSIsConnecting.current = false;
  //             ws.close();
  //           } else {
  //           }
  //         }
  //       }, 4000);
  //
  //       holdingsDataProcessingTimerRef.current = setInterval(
  //         processHoldingsDataMessageQueue,
  //         HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
  //       );
  //       chartPriceHoldingsDataProcessingTimerRef.current = setInterval(
  //         processChartPriceHoldingsDataMessageQueue,
  //         HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
  //       );
  //     };
  //
  //     ws.onmessage = (event) => {
  //       if (!isWSMounted.current) return;
  //       updateLastMessageTimestamp("holding", new Date());
  //
  //       try {
  //         if (
  //           event.data.includes(`"success":true,"channel"`) ||
  //           event.data.includes("Ping")
  //         ) {
  //           console.log(
  //             `CHART HOLDINGS - ${type.toUpperCase()} ON MESSAGE :`,
  //             event.data,
  //           );
  //           return;
  //         }
  //
  //         let message = JSON.parse(event.data);
  //         if (message?.data?.wallet || message?.channel == "chartHoldings") {
  //           if (message?.data.holding.investedSol == 0) return;
  //           // throttledUpdateHoldingsMessages({
  //           //   wallet: message?.data?.wallet,
  //           //   tokens: [message?.data?.holding],
  //           // });
  //           holdingsDataMessageQueueRef.current.push({
  //             data: {
  //               wallet: message?.data?.wallet,
  //               tokens: [message?.data?.holding],
  //             },
  //             timestamp: Date.now(),
  //           });
  //           return;
  //         } else if (message?.mint && message?.price) {
  //           // throttledSetChartPriceMessage(message);
  //           chartPriceHoldingsDataMessageQueueRef.current.push({
  //             data: message,
  //             timestamp: Date.now(),
  //           });
  //         }
  //
  //         console.log(
  //           `CHART HOLDINGS - ${type.toUpperCase()} ON MESSAGE :`,
  //           event.data,
  //         );
  //
  //         if (message.channel === "ping") {
  //           allWSLastPingTimestamp.current = Date.now();
  //           return;
  //         }
  //       } catch (e) {
  //         console.warn("Error parsing message:", e);
  //       }
  //     };
  //
  //     ws.onerror = (event) => {
  //       if (!isWSMounted.current) return;
  //       setWebsocketState("holding", {
  //         status: "unknown",
  //       });
  //       addError("holding", {
  //         message: (event as any).type || "Unknown WebSocket error",
  //         timestamp: new Date(),
  //       })
  //
  //       console.warn("CHART HOLDING - ERROR ⛔:", event);
  //     };
  //
  //     ws.onclose = () => {
  //       if (!isWSMounted.current) return;
  //       if (ws.readyState === WebSocket.CLOSING) {
  //         setWebsocketState("holding", {
  //           status: "closing",
  //         });
  //       }
  //       if (ws.readyState === WebSocket.CLOSED) {
  //         setWebsocketState("holding", {
  //           status: "disconnected",
  //           retryCount: 0,
  //         });
  //       }
  //       console.warn("CHART HOLDING - DISCONNECTED ❌");
  //
  //       allWSPingTimeout.current = setTimeout(() => {
  //         setWebsocketState("holding", {
  //           status: "reconnecting",
  //           retryCount: holding.retryCount + 1,
  //         })
  //         console.warn("CHART HOLDING - RECONNECTING ⌛", reconnectAttempts);
  //         reconnectAttempts++;
  //         setWSChartHoldingRef(null);
  //         isWSMounted.current = true;
  //         allWSIsConnecting.current = false;
  //         allWSConnectedStatus.current = false;
  //         WSChartHoldingRef.current = null;
  //         setListSubscribedMints([]);
  //         connectHoldingsWebSocket();
  //       }, 1000);
  //     };
  //   } catch (error) {
  //     if (!isWSMounted.current) return;
  //     setWebsocketState("holding", {
  //       status: "unknown",
  //     });
  //     addError("holding", {
  //       message: (error as any).message || "Failed to connect WebSocket",
  //       timestamp: new Date(),
  //     })
  //     console.warn("CHART HOLDING - CONNECTION FAILED ❌:", error);
  //   }
  // };

  useEffect(() => {
    setListAllMints([]);
    setListSubscribedMints([]);
    // connectHoldingsWebSocket();

    return () => {
      disconnect();
      // isWSMounted.current = false;
      // setWebsocketState("holding", {
      //   status: "disconnected",
      //   retryCount: 0,
      // });
      // if (allWSPingInterval.current) {
      //   clearInterval(allWSPingInterval.current);
      // }
      //
      // if (allWSPingTimeout.current) {
      //   clearTimeout(allWSPingTimeout.current);
      // }
      //
      // if (WSChartHoldingRef.current) {
      //   WSChartHoldingRef.current.close();
      //   WSChartHoldingRef.current = null;
      //   setWSChartHoldingRef(null);
      // }
    };
  }, []);

  const { remainingScreenWidth } = usePopupStore();
  const isSnapMobile = remainingScreenWidth < 1000;

  const adjustedDummyData = useMemo(() => {
    const newDummyData = dummyfilteredTokenBasedOnSelectedWalletData.map(
      (d) => {
        return {
          token: {
            name: d.token.name,
            symbol: d.token.symbol,
            dex: d.token.dex,
            mint: d.token.mint,
            pair: d.token.pair,
            supply: d.token.supply,
            image: d.token.image,
            twitter: d.token.telegram,
            website: d.token.website,
            origin_dex: d.token.origin_dex,
            buys: d.token.buys,
            sells: d.token.sells,
          },
          list: d.list.map((token) => {
            return {
              ...token,
              wallet: finalWallets ? finalWallets[0]?.address : "",
            };
          }),
        };
      },
    );

    return newDummyData;
  }, [isHoldingsTutorial, finalWallets]);

  return (
    <>
      {finalLoading ? (
        <HoldingsListSectionLoading />
      ) : (
        <>
          {width! >= 1280 && !isSnapMobile ? (
            <>
              {/* Desktop */}
              {filteredTokenBasedOnSelectedWallet.length === 0 &&
              !isHoldingsTutorial ? (
                <div className="mb-12 hidden w-full flex-grow flex-col items-center justify-center bg-[#080811] md:flex">
                  <EmptyState state="Holding" />
                </div>
              ) : (
                <div className="relative mb-12 hidden w-full flex-grow grid-cols-1 xl:grid">
                  <HoldingsTable
                    // @ts-ignore
                    list={
                      isHoldingsTutorial
                        ? adjustedDummyData
                        : filteredTokenBasedOnSelectedWallet
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Mobile */}
              {filteredTokenBasedOnSelectedWallet.length === 0 &&
              !isHoldingsTutorial ? (
                <div
                  className={cn(
                    "mb-12 flex w-full flex-grow flex-col items-center justify-center md:hidden",
                    isSnapMobile && "md:flex",
                  )}
                >
                  <EmptyState state="Holding" />
                </div>
              ) : (
                <div
                  className={cn(
                    "relative mb-12 flex w-full flex-grow grid-cols-1 xl:hidden",
                    isSnapMobile && "xl:flex",
                  )}
                >
                  <HoldingsListMobile
                    // @ts-ignore
                    list={
                      isHoldingsTutorial
                        ? adjustedDummyData
                        : filteredTokenBasedOnSelectedWallet
                    }
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

const HoldingsListSectionLoading = () => {
  const width = useWindowSizeStore((state) => state.width);

  const variant = width! < 1280 ? "mobile" : "desktop";
  return variant === "desktop" ? (
    <div className="relative mb-12 hidden w-full flex-grow grid-cols-1 xl:grid">
      <div className="flex w-full flex-grow flex-col overflow-hidden rounded-[8px]">
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
        >
          <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
            <div className="flex h-10 min-w-max items-center rounded-t-[8px] border-b border-border pl-4 pr-4">
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[14%] items-center p-3">
                <Skeleton className="h-4 w-full rounded-[4px] bg-gradient-to-r" />
              </div>
            </div>

            <div className="flex h-auto w-full flex-col">
              {Array.from({ length: 6 }).map((_, index) => (
                <HoldingsCardLoading key={index} index={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  ) : (
    <div className="flex h-auto w-full flex-col gap-y-2 px-4 lg:px-0">
      {Array.from({ length: 30 }).map((_, index) => (
        <HoldingsCardMobileLoading key={index} />
      ))}
    </div>
  );
};
