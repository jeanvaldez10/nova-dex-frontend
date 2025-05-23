import React from "react";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWalletsMessageStore } from "@/stores/wallets/use-wallets-message.store";
import { useCurrentTokenFreshWalletsStore } from "@/stores/token/use-current-token-fresh-wallets.store";
import { useQuery, useMutation } from "@tanstack/react-query";
import useVisibilityRefresh from "@/hooks/use-visibility-refresh";
import axios from "@/libraries/axios";
import cookies from "js-cookie";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import { getServerTime } from "@/apis/rest/settings/server-time";
import { getFreshFundedInfo } from "@/apis/rest/trades";
// ######## Components 🧩 ########
import Link from "next/link";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Types 🗨️ ########
import {
  HoldingsConvertedMessageType,
  TokenDataMessageType,
  TransactionInfo,
  ChartTraderInfo,
  ChartHoldersInfo,
} from "@/types/ws-general";
// ######## Utils & Helpers 🤝 ########
import { deduplicateAndPrioritizeLatestData_TransactionWS } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";
// ######## Constants ☑️ ########
import { TRANSACTION_BATCH_PROCESSING_INTERVAL_MS } from "@/constants/duration";
import {
  defaultTVChartProperties,
  defaultTVChartPropertiesMainSeriesProperties,
} from "@/constants/trading-view.constant";
import { useWebsocketMonitor } from "@/stores/use-websocket-monitor.store";
import { useWebsocket } from "@/hooks/use-websocket";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useMatchWalletTrackerTradesStore } from "@/stores/token/use-match-wallet-tracker-trades";

type TokenDataQueuedMessage = {
  transaction: TransactionInfo;
  chart_holder: ChartHoldersInfo;
  chart_traders: ChartTraderInfo[];
};
const TokenSSRConfig = ({
  initChartData,
  isFetched,
}: {
  initChartData: TokenDataMessageType;
  isFetched: boolean;
}) => {
  const mint = useParams()?.["mint-address"] as string;
  const tokenDataMessageQueueRef = useRef<TokenDataQueuedMessage[]>([]);
  const tokenDataProcessingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Process queued messages
  const processTokenDataMessageQueue = () => {
    const currentQueue = [...tokenDataMessageQueueRef.current];
    tokenDataMessageQueueRef.current = [];

    currentQueue.forEach(
      ({
        // token,
        transaction,
        // price,
        // volume,
        // data_security,
        chart_holder,
        chart_traders,
        // timestamp,
      }) => {
        if (isTradesTableScrollMoreThanZeroRef.current) {
          setPausedTransactionMessages(transaction);
        } else {
          setTransactionMessages(transaction);
        }
        setChartHolderMessages(chart_holder?.chart_holders);
        setTotalHolderMessages(chart_holder?.total_holders);
        setChartTraderMessages(chart_traders);
      },
    );
  };

  // Latest TX
  // const resetLatestTransactionMessages = useLatestTransactionMessageStore(
  //   (state) => state.resetMessages,
  // );

  // Auto Refresh upon visibility change 👁️
  useVisibilityRefresh({
    ms: 60_000 * 10,
  });

  // State Configuration ✨
  const {
    // setWSMintRef,
    // setWSHoldingRef,
    dataSecurityMessage,
    timestamp,
    setTokenInfoMessage,
    setInitTransactionMessages,
    setTransactionMessages,
    setPriceMessage,
    setVolumeMessage,
    setDataSecurityMessage,
    setChartHolderMessages,
    setTotalHolderMessages,
    setChartTraderMessages,
    setTimestamp,
    setDeveloperTokens,
    cleanup: cleanupToken,
  } = useTokenMessageStore();

  const setTokenHolding = useTokenHoldingStore((state) => state.setMessage);
  const setIsLoadingHolding = useTokenHoldingStore(
    (state) => state.setIsLoading,
  );
  const setLastHoldingTimestamp = useTokenHoldingStore(
    (state) => state.setLastTimestamp,
  );
  const setSolPrice = useSolPriceMessageStore((state) => state.setMessages);
  const setHoldingsMessages = useHoldingsMessageStore(
    (state) => state.updateMessage,
  );

  // useEffect(() => {
  //   console.log("HOLDINGS MSG ✨", holdingToken);
  // }, [holdingToken]);
  const setWalletHoldingMessages = useWalletsMessageStore(
    (state) => state.setMessages,
  );

  useQuery({
    queryKey: ["solanaPrice"],
    queryFn: async () => {
      const { data } = await axios.get<{ price: number }>(
        getBaseURLBasedOnRegion("/prices/solana"),
      );
      if (data.price)
        localStorage.setItem("current_solana_price", String(data.price));
      setSolPrice(data);
      return data.price;
    },
  });

  const setFreshWallets = useCurrentTokenFreshWalletsStore(
    (state) => state.setCurrentTokenFreshwallets,
  );
  const getFreshWallets = useMutation({
    mutationFn: getFreshFundedInfo,
    onSuccess: (data) => {
      // console.log("Fresh Wallets Info 🟢", {
      //   data: data.results,
      // });
      setFreshWallets(data?.results);
    },
    onError: () => {
      // console.warn("Fresh Wallets Error 🔴", error);
    },
  });

  // ### Hover Transaction Paused Configuration
  const [pausedTransactionList, setPausedTransactionList] = useState<
    TransactionInfo[]
  >([]);
  const setPausedTransactionMessages = (
    newMessages: TransactionInfo | TransactionInfo[],
  ) => {
    setPausedTransactionList((prev) => {
      const updatedList = deduplicateAndPrioritizeLatestData_TransactionWS([
        ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
        ...prev,
      ]);

      return updatedList;
    });
  };
  const isPaused = useTradesTableSettingStore((state) => state.isPaused);
  const isTradesTableScrollMoreThanZeroRef = useRef(isPaused);
  useEffect(() => {
    isTradesTableScrollMoreThanZeroRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    if (!isPaused && pausedTransactionList.length > 0) {
      setTransactionMessages(pausedTransactionList);
      setPausedTransactionList([]);
    }
  }, [isPaused]);

  // WS Configuration 🛜
  // const WSMintRef = useRef<WebSocket | null>(null);
  // const WSHoldingRef = useRef<WebSocket | null>(null);
  // const isWSMintMounted = useRef(true);
  // const isWSHoldingMounted = useRef(true);

  useQuery({
    queryKey: ["developer-tokens", dataSecurityMessage?.deployer],
    queryFn: async () => {
      if (!dataSecurityMessage?.deployer) return null;

      const { data } = await axios.get(
        getBaseURLBasedOnRegion("/developer-tokens"),
        {
          params: {
            developer: dataSecurityMessage.deployer,
          },
        },
      );
      setDeveloperTokens(data);
      return data;
    },
    enabled: !!dataSecurityMessage?.deployer,
  });

  // const chartHoldingWSReconnectCount = useRef<number>(0); // 4
  // const chartHoldingWSPingInterval = useRef<NodeJS.Timeout | null>(null); // 7
  // const chartHoldingWSPingErrorTimeout = useRef<NodeJS.Timeout | null>(null); // 5
  // const chartHoldingWSPingCloseTimeout = useRef<NodeJS.Timeout | null>(null); // 5
  // const chartHoldingWSLastPingTimestamp = useRef<number>(); // 8
  // const chartHoldingWSConnectedStatus = useRef<boolean>(false); // 9
  // const chartHoldingWSIsConnecting = useRef<boolean>(false); // 9
  //
  // const mintWSReconnectCount = useRef<number>(0); // 4
  // const mintWSPingInterval = useRef<NodeJS.Timeout | null>(null); // 7
  // const mintWSPingErrorTimeout = useRef<NodeJS.Timeout | null>(null); // 5
  // const mintWSPingCloseTimeout = useRef<NodeJS.Timeout | null>(null); // 5
  // const mintWSLastPingTimestamp = useRef<number>(); // 8
  // const mintWSConnectedStatus = useRef<boolean>(false); // 9
  // const mintWSIsConnecting = useRef<boolean>(false); // 9
  const { addError } = useWebsocketMonitor();

  const { send: mintWSSend, disconnect: disconnectMintWs } = useWebsocket({
    name: "tokenInfo",
    url: String(getWSBaseURLBasedOnRegion()),
    onopen: () => {
      const subscriptionMessage = [
        {
          token: cookies.get("_nova_session"),
          channel: mint,
        },
      ];

      mintWSSend(JSON.stringify(subscriptionMessage));

      tokenDataProcessingTimerRef.current = setInterval(
        processTokenDataMessageQueue,
        TRANSACTION_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onmessage: (event) => {
      try {
        if (String(event.data).includes('{"channel":"ping", "success":true}')) {
          return;
        }

        if (
          event.data.includes(`"success":true,"channel"`) ||
          event.data.includes("Ping")
        ) {
          return;
        }

        const parsed = JSON.parse(event.data);
        const message = Array.isArray(parsed) ? parsed : parsed?.data;

        if (Array.isArray(parsed)) {
          setTransactionMessages(parsed);
          return;
        }
        // console.log('MESSAGE RECEIVED 🟢', {
        //   message,
        //   price: message?.price,
        // })
        setTokenInfoMessage(message?.token);
        setPriceMessage(message?.price);
        setVolumeMessage(message?.volume);
        setDataSecurityMessage(message?.data_security);
        setTimestamp(timestamp);
        tokenDataMessageQueueRef.current.push({
          transaction: message.transaction,
          chart_holder: message.chart_holders,
          chart_traders: message.chart_traders,
        });
      } catch (e) {
        addError("tokenInfo", {
          message: (e as any).message || "Error parsing message",
          timestamp: new Date(),
        });
      }
    },
  });

  const { send: chartHoldingWSSend, disconnect: disconnectChartHoldingtWs } =
    useWebsocket({
      name: "tokenHolding",
      url: String(getWSBaseURLBasedOnRegion()),
      onopen: () => {
        const subscriptionMessage = [
          {
            token: cookies.get("_nova_session"),
            channel: "chartHoldings",
            mint,
          },
        ];

        chartHoldingWSSend(JSON.stringify(subscriptionMessage));
      },
      onmessage: (event) => {
        try {
          if (
            String(event.data).includes('{"channel":"ping", "success":true}')
          ) {
            return;
          }

          const message = JSON.parse(event.data)?.data;

          if (message?.wallet) {
            setIsLoadingHolding(false);

            console.warn("TCS ✨ | Chart Holding DEBUG | Message received 📨", {
              message,
            });

            if (message.holding.investedSol === 0) return;

            if (!firstChartHoldingMessage) {
              setFirstChartHoldingMessage({
                wallet: message.wallet,
                tokens: [message.holding],
              });
            }

            setLastHoldingTimestamp(Date.now());
            setTokenHolding({
              wallet: message.wallet,
              tokens: [message.holding],
            });

            setWalletHoldingMessages([
              {
                wallet: message.wallet,
                tokens: [message.holding],
              },
            ]);
            setHoldingsMessages({
              wallet: message.wallet,
              tokens: [message.holding],
            });
          }
        } catch (error) {
          addError("tokenHolding", {
            message: (error as any).message || "Error parsing message",
            timestamp: new Date(),
          });
        }
      },
    });

  const cleanupHolding = useTokenHoldingStore((state) => state.cleanup);
  const resetFilteredWalletTradesState = useFilteredWalletTradesStore(
    (state) => state.resetFilteredWalletTradesState,
  );
  const resetCurrentTokenDeveloperTradesState =
    useCurrentTokenDeveloperTradesStore(
      (state) => state.resetCurrentTokenDeveloperTradesState,
    );
  const resetMatchWalletTrackerTrades = useMatchWalletTrackerTradesStore(
    (state) => state.resetMatchWalletTrackerTrades,
  );
  useEffect(() => {
    return () => {
      resetMatchWalletTrackerTrades();
      disconnectChartHoldingtWs();
      disconnectMintWs();
      cleanupToken();
      cleanupHolding();
      resetFilteredWalletTradesState();
      resetCurrentTokenDeveloperTradesState();
      setIsLoadingHolding(true);
    };
  }, []);

  const [firstChartHoldingMessage, setFirstChartHoldingMessage] =
    useState<HoldingsConvertedMessageType | null>(null);

  const setBaseTVState = () => {
    console.warn("TV BASE STATE DEBUG ✨");

    if (
      !localStorage.getItem("tradingview.chartproperties") ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties",
        JSON.stringify(defaultTVChartProperties),
      );
    }
    if (
      !localStorage.getItem(
        "tradingview.chartproperties.mainSeriesProperties",
      ) ||
      localStorage
        .getItem("tradingview.chartproperties.mainSeriesProperties")
        ?.includes(`"candleStyle":{"upColor":"#089981","downColor":"#F23645"`)
    ) {
      localStorage.setItem(
        "tradingview.chartproperties.mainSeriesProperties",
        JSON.stringify(defaultTVChartPropertiesMainSeriesProperties),
      );
    }
  };

  useEffect(() => {
    if (
      !cookies.get("_chart_interval_resolution") ||
      cookies.get("_chart_interval_resolution") === "USD" ||
      cookies.get("_chart_interval_resolution") === "SOL"
    ) {
      cookies.set("_chart_interval_resolution", "1S");
    }
    if (!localStorage.getItem("chart_currency")) {
      localStorage.setItem("chart_currency", "USD");
      cookies.set("_chart_currency", "USD");
    }
    if (!localStorage.getItem("chart_type")) {
      localStorage.setItem("chart_type", "MCap");
    }
    if (!localStorage.getItem("chart_hide_buy_avg_price_line")) {
      localStorage.setItem("chart_hide_buy_avg_price_line", "false");
    }
    if (!localStorage.getItem("chart_hide_sell_avg_price_line")) {
      localStorage.setItem("chart_hide_sell_avg_price_line", "false");
    }

    setBaseTVState();

    let themeSetCount = 0;
    const themeSetInterval = setInterval(() => {
      if (themeSetCount < 10) {
        themeSetCount++;
        setBaseTVState();
      } else {
        clearInterval(themeSetInterval);
      }
    }, 500);

    return () => {
      if (themeSetInterval) {
        clearInterval(themeSetInterval);
      }
    };
  }, []);

  const initialFetch = useRef(true);
  useEffect(() => {
    if (
      initChartData &&
      initChartData.success !== false &&
      initialFetch.current === true
    ) {
      initialFetch.current = false;

      setBaseTVState();

      const chartHolders = initChartData?.chart_holders.chart_holders?.map(
        (holder) => holder?.maker,
      );
      getFreshWallets.mutate(chartHolders);
      const freshWalletInterval = setInterval(() => {
        getFreshWallets.mutate(chartHolders);
      }, 10000);

      // console.log('INIT RECEIVED 🟢', {
      //   initChartData,
      //   price: initChartData?.price,
      // })

      setTokenInfoMessage(initChartData?.token);
      setInitTransactionMessages(initChartData?.transactions?.reverse());
      setPriceMessage(initChartData?.price);
      setVolumeMessage(initChartData?.volume);
      setDataSecurityMessage(initChartData?.data_security);
      setChartHolderMessages(initChartData?.chart_holders.chart_holders);
      setTotalHolderMessages(initChartData?.chart_holders.total_holders);
      setChartTraderMessages(initChartData?.chart_traders);
      setTimestamp(Date.now() / 1000);

      return () => {
        if (freshWalletInterval) {
          clearInterval(freshWalletInterval);
        }
      };
    }
  }, [isFetched]);

  const timeSyncToastId = useRef<null | any>(null);
  const checkSystemTimeSync = async () => {
    const serverTime = await getServerTime();
    const userTime = new Date();

    const diffInSeconds = Math.abs((Number(userTime) - serverTime) / 1000);
    const threshold = 60 * 3;

    if (diffInSeconds > threshold) {
      timeSyncToastId.current = toast.custom(
        (t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            customMessage={
              <div className="flex items-center gap-x-1.5 text-sm leading-[20px] text-fontColorPrimary">
                <span>Sync Error!</span>
                <span>
                  Time to{" "}
                  <Link
                    href="https://support.repzio.com/hc/en-us/articles/360042151612-How-to-Automatically-Synchronize-the-Date-Time-in-Windows-10-or-Mac-OS"
                    target="_blank"
                    className="text-destructive underline"
                  >
                    sync
                  </Link>{" "}
                  your device
                </span>
              </div>
            }
            state="ERROR"
          />
        ),
        {
          duration: Infinity,
          id: "time-sync",
        },
      );
      // console.log("CSTS - TIME MISMATCH! 🔴", {
      //   serverTime,
      //   userTime: Number(userTime),
      //   diffInSeconds,
      // });
    } else {
      toast.dismiss(timeSyncToastId.current);
      // console.log("CSTS - TIME MATCH! 🟢", {
      //   serverTime,
      //   userTime: Number(userTime),
      //   diffInSeconds,
      // });
    }
  };

  useEffect(() => {
    let oldTime: number = new Date().getTime();

    const checkSystemTimePeriodically = () => {
      const d = new Date().getTime();

      const diff = Math.abs(d - oldTime);

      if (diff > 60_000 * 3) {
        // console.log("CSTS - You changed the time! 🔴", {
        //   diff,
        //   oldTime,
        // });
        timeSyncToastId.current = toast.custom(
          (t: any) => (
            <CustomToast
              tVisibleState={t.visible}
              customMessage={
                <div className="flex items-center gap-x-1.5 text-sm leading-[20px] text-fontColorPrimary">
                  <span>Sync Error!</span>
                  <span>
                    Time to{" "}
                    <Link
                      href="https://support.repzio.com/hc/en-us/articles/360042151612-How-to-Automatically-Synchronize-the-Date-Time-in-Windows-10-or-Mac-OS"
                      target="_blank"
                      className="text-destructive underline"
                    >
                      sync
                    </Link>{" "}
                    your device
                  </span>
                </div>
              }
              state="ERROR"
            />
          ),
          {
            duration: Infinity,
            id: "time-sync",
          },
        );
      } else {
        toast.dismiss(timeSyncToastId.current);
        // console.log("CSTS - You not change the time! 🟢", {
        //   diff,
        //   oldTime,
        // });
      }

      oldTime = d;
    };

    const checkSystemTimeInSyncInterval = setInterval(
      checkSystemTimePeriodically,
      10_000,
    );
    const checkSystemTimeInSyncWithFetchInterval = setInterval(
      checkSystemTimeSync,
      60_000,
    );

    checkSystemTimePeriodically();
    checkSystemTimeSync();

    return () => {
      clearInterval(checkSystemTimeInSyncInterval);
      clearInterval(checkSystemTimeInSyncWithFetchInterval);
    };
  }, []);

  return null;
};

export default TokenSSRConfig;
