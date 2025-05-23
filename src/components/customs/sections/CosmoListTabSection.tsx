"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBlacklistedDeveloperFilterStore } from "@/stores/cosmo/use-blacklisted-developer-filter.store";
import { useCosmoListsStore } from "@/stores/cosmo/use-cosmo-lists.store";
import { useNewlyCreatedFilterStore } from "@/stores/cosmo/use-newly-created-filter.store";
import { useAboutToGraduateFilterStore } from "@/stores/cosmo/use-about-to-graduate-filter.store";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import cookies from "js-cookie";
// ######## APIs 🛜 ########
import { getCosmoInitialFetch, getHiddenTokens } from "@/apis/rest/cosmo";
import { getBlacklistedDevelopers } from "@/apis/rest/cosmo";
// ######## Components 🧩 ########
import CosmoDesktop from "./cosmo/CosmoDesktop";
import CosmoMobile from "./cosmo/CosmoMobile";
// ######## Utils & Helpers 🤝 ########
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
// ######## Constants ☑️ ########
import { COSMO_BATCH_PROCESSING_INTERVAL_MS } from "@/constants/duration";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useWebsocketMonitor } from "@/stores/use-websocket-monitor.store";
import { useWebsocket } from "@/hooks/use-websocket";
import { usePopupStore } from "@/stores/use-popup-state";
import CosmoListSectionLoading from "../loadings/CosmoListSectionLoading";

type QueuedMessage = {
  data: CosmoDataMessageType;
  timestamp: number;
};

const filterBlacklistedDevelopers = (
  messages: CosmoDataMessageType[],
  blacklistedDeveloperData: string[],
) => {
  return messages.filter(
    (message) => !blacklistedDeveloperData.includes(message.developer),
  );
};

const filterHiddenTokens = (
  messages: CosmoDataMessageType[],
  hiddenTokensData: string[],
  showHidden: boolean,
) => {
  // If hiddenTokensData is empty, just return all messages
  if (hiddenTokensData.length === 0) {
    return messages;
  }

  // If showHidden is true, only include hidden tokens
  // If showHidden is false, exclude hidden tokens
  return messages.filter(
    (message) => showHidden === hiddenTokensData.includes(message.mint),
  );
};

export default function CosmoListTabSection() {
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State ✨
  const globalBlacklistedDevelopers = useBlacklistedDeveloperFilterStore(
    (state) => state.blacklistedDevelopers,
  );
  const setGlobalBlacklistedDevelopers = useBlacklistedDeveloperFilterStore(
    (state) => state.setBlacklistedDevelopers,
  );
  const globalHiddenTokens = useHiddenTokensStore(
    (state) => state.hiddenTokens,
  );
  const setGlobalHiddenTokens = useHiddenTokensStore(
    (state) => state.setHiddenTokens,
  );

  // State
  const newlyCreatedListRef = useRef<CosmoDataMessageType[]>([]);
  const aboutToGraduateListRef = useRef<CosmoDataMessageType[]>([]);
  const graduatedListRef = useRef<CosmoDataMessageType[]>([]);
  const latestMessagesRef = useRef<CosmoDataMessageType[]>([]);
  const newlyCreatedList = useCosmoListsStore(
    (state) => state.newlyCreatedList,
  );
  const aboutToGraduateList = useCosmoListsStore(
    (state) => state.aboutToGraduateList,
  );
  const graduatedList = useCosmoListsStore((state) => state.graduatedList);
  const latestMessagesList = useCosmoListsStore(
    (state) => state.latestMessages,
  );
  useEffect(() => {
    newlyCreatedListRef.current = newlyCreatedList;
  }, [newlyCreatedList]);
  useEffect(() => {
    aboutToGraduateListRef.current = aboutToGraduateList;
  }, [aboutToGraduateList]);
  useEffect(() => {
    graduatedListRef.current = graduatedList;
  }, [graduatedListRef]);
  useEffect(() => {
    latestMessagesRef.current = latestMessagesList;
  }, [latestMessagesList]);

  // Store actions
  const updateLatestMessages = useCosmoListsStore(
    (state) => state.updateLatestMessages,
  );
  const resetLatestMessages = useCosmoListsStore(
    (state) => state.resetLatestMessages,
  );
  const setNewlyCreatedList = useCosmoListsStore(
    (state) => state.setNewlyCreatedList,
  );
  const setAboutToGraduateList = useCosmoListsStore(
    (state) => state.setAboutToGraduateList,
  );
  const setGraduatedList = useCosmoListsStore(
    (state) => state.setGraduatedList,
  );
  const updateNewlyCreatedChangedCount = useCosmoListsStore(
    (state) => state.updateNewlyCreatedChangedCount,
  );
  const updateNewlyCreated = useCosmoListsStore(
    (state) => state.updateNewlyCreated,
  );
  const updateAboutToGraduatedChangedCount = useCosmoListsStore(
    (state) => state.updateAboutToGraduatedChangedCount,
  );
  const updateAboutToGraduate = useCosmoListsStore(
    (state) => state.updateAboutToGraduate,
  );
  const updateGraduated = useCosmoListsStore((state) => state.updateGraduated);
  const updateGraduatedChangedCount = useCosmoListsStore(
    (state) => state.updateGraduatedChangedCount,
  );
  const setPausedNewlyCreated = useCosmoListsStore(
    (state) => state.setPausedNewlyCreated,
  );
  const setOtherPausedNewlyCreated = useCosmoListsStore(
    (state) => state.setOtherPausedNewlyCreated,
  );
  const setPausedAboutToGraduate = useCosmoListsStore(
    (state) => state.setPausedAboutToGraduate,
  );
  const setPausedGraduated = useCosmoListsStore(
    (state) => state.setPausedGraduated,
  );

  // ### Hover
  const isCosmoTutorial = useUserInfoStore((state) => state.isCosmoTutorial);
  const isCosmoTutorialRef = useRef(isCosmoTutorial);
  useEffect(() => {
    isCosmoTutorialRef.current = isCosmoTutorial;
  }, [isCosmoTutorial]);
  const [isNewlyCreatedListHovered, setIsNewlyCreatedListHovered] =
    useState(false);
  const isNewlyCreatedListHoveredRef = useRef(isNewlyCreatedListHovered);
  useEffect(() => {
    isNewlyCreatedListHoveredRef.current = isNewlyCreatedListHovered;
  }, [isNewlyCreatedListHovered]);

  const [isAboutToGraduateListHovered, setIsAboutToGraduateHovered] =
    useState(false);
  const isAboutToGraduateHoveredRef = useRef(isAboutToGraduateListHovered);
  useEffect(() => {
    isAboutToGraduateHoveredRef.current = isAboutToGraduateListHovered;
  }, [isAboutToGraduateListHovered]);

  const [isGraduatedListHovered, setIsGraduatedListHovered] = useState(false);
  const isGraduatedListHoveredRef = useRef(isGraduatedListHovered);
  useEffect(() => {
    isGraduatedListHoveredRef.current = isGraduatedListHovered;
  }, [isGraduatedListHovered]);

  const blacklistedDevelopersRef = useRef<string[]>(
    globalBlacklistedDevelopers,
  );
  const hiddenTokensRef = useRef<string[]>(globalHiddenTokens);

  useEffect(() => {
    blacklistedDevelopersRef.current = globalBlacklistedDevelopers;
  }, [globalBlacklistedDevelopers]);

  useEffect(() => {
    hiddenTokensRef.current = globalHiddenTokens;
  }, [globalHiddenTokens]);

  // ### Initial Fetch 🛜
  const {
    data: cosmoInitialData,
    refetch,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["cosmo-initial-fetch"],
    queryFn: getCosmoInitialFetch,
    // gcTime: 1000
  });

  useEffect(() => {
    if (!isLoading && cosmoInitialData) {
      const { created, about_to_graduate, graduated } = cosmoInitialData;
      setNewlyCreatedList(created);
      setAboutToGraduateList(about_to_graduate);
      setGraduatedList(graduated);
      updateGraduatedChangedCount();
      updateAboutToGraduatedChangedCount();
      updateNewlyCreatedChangedCount();
    }
  }, [isLoading, cosmoInitialData]);

  const isLoadingFilterFetchNewlyCreatedList = useNewlyCreatedFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetchNewlyCreatedList = useNewlyCreatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  const isLoadingFilterFetchAboutToGraduateList = useAboutToGraduateFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetchAboutToGraduateList =
    useAboutToGraduateFilterStore((state) => state.setIsLoadingFilterFetch);
  const isLoadingFilterFetchGraduateList = useGraduatedFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetchGraduateList = useGraduatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );

  const [isFirst, setIsFirst] = useState(false);
  const timeoutFirstRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    timeoutFirstRef.current = setTimeout(() => {
      setIsFirst(true);
    }, 2000);
    if (!isFirst) return;
    let lastInteractionTime = Date.now();
    let inactivityCheckInterval;

    const updateLastInteraction = () => {
      lastInteractionTime = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      const diff = now - lastInteractionTime;

      if (diff > 60_000 * 10) {
        setIsLoadingFilterFetchNewlyCreatedList(true);
        setIsLoadingFilterFetchAboutToGraduateList(true);
        setIsLoadingFilterFetchGraduateList(true);
        refetch();
        lastInteractionTime = Date.now();
      } else {
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInactivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", updateLastInteraction);
    document.addEventListener("keydown", updateLastInteraction);

    inactivityCheckInterval = setInterval(checkInactivity, 60_000);

    return () => {
      // Clean up event listeners and interval
      if (timeoutFirstRef.current) {
        timeoutFirstRef.current = null;
        clearTimeout(timeoutFirstRef.current!);
      }

      document.removeEventListener("mousemove", updateLastInteraction);
      document.removeEventListener("keydown", updateLastInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(inactivityCheckInterval);
      resetLatestMessages();
      setNewlyCreatedList([]);
      setAboutToGraduateList([]);
      setGraduatedList([]);
      setPausedNewlyCreated([]);
      setPausedAboutToGraduate([]);
      setPausedGraduated([]);
    };
  }, [isFirst]);

  const {
    data: blacklistedDeveloperData,
    isLoading: isLoadingBlacklistedDeveloper,
  } = useQuery({
    queryKey: ["blacklisted-developers"],
    queryFn: getBlacklistedDevelopers,
    retry: 3,
  });

  const { data: hiddenTokensData, isLoading: isLoadingHiddenTokens } = useQuery(
    {
      queryKey: ["hidden-tokens"],
      queryFn: getHiddenTokens,
      retry: 3,
    },
  );

  useEffect(() => {
    if (
      !isLoading &&
      cosmoInitialData &&
      !isLoadingBlacklistedDeveloper &&
      blacklistedDeveloperData &&
      !isLoadingHiddenTokens &&
      hiddenTokensData
    ) {
      const { created, about_to_graduate, graduated } = cosmoInitialData;

      // Get the current showHide settings from each filter store
      const showHiddenNewlyCreated =
        useNewlyCreatedFilterStore.getState().filters.genuine.checkBoxes
          .showHide;
      const showHiddenAboutToGraduate =
        useAboutToGraduateFilterStore.getState().filters.genuine.checkBoxes
          .showHide;
      const showHiddenGraduated =
        useGraduatedFilterStore.getState().filters.genuine.checkBoxes.showHide;

      setNewlyCreatedList(
        filterHiddenTokens(
          filterBlacklistedDevelopers(created, blacklistedDeveloperData),
          hiddenTokensData,
          showHiddenNewlyCreated,
        ).sort((a, b) => {
          const timestampA = BigInt(Number(a.created));
          const timestampB = BigInt(Number(b.created));

          return Number(timestampB - timestampA);
        }),
      );
      setAboutToGraduateList(
        filterHiddenTokens(
          filterBlacklistedDevelopers(
            about_to_graduate,
            blacklistedDeveloperData,
          ),
          hiddenTokensData,
          showHiddenAboutToGraduate,
        ).sort((a, b) => {
          if (a.migrating && !b.migrating) return -1;
          if (!a.migrating && b.migrating) return 1;

          const marketCapA = Number(a.market_cap_usd);
          const marketCapB = Number(b.market_cap_usd);

          return Number(marketCapB - marketCapA);
        }),
      );
      setGraduatedList(
        filterHiddenTokens(
          filterBlacklistedDevelopers(graduated, blacklistedDeveloperData),
          hiddenTokensData,
          showHiddenGraduated,
        ).sort((a, b) => {
          const timestampA = BigInt(Number(a.migrated_time));
          const timestampB = BigInt(Number(b.migrated_time));

          return Number(timestampB - timestampA);
        }),
      );
      updateGraduatedChangedCount();
      updateAboutToGraduatedChangedCount();
      updateNewlyCreatedChangedCount();

      setGlobalBlacklistedDevelopers(blacklistedDeveloperData);
      blacklistedDevelopersRef.current = blacklistedDeveloperData;

      setGlobalHiddenTokens(hiddenTokensData);
      hiddenTokensRef.current = hiddenTokensData;
    }
  }, [
    isLoading,
    cosmoInitialData,
    isLoadingBlacklistedDeveloper,
    blacklistedDeveloperData,
    isLoadingHiddenTokens,
    hiddenTokensData,
  ]);

  // Process queued messages
  const processNewTokenMessage = (newDataMessage: CosmoDataMessageType) => {
    const dexes = ["Raydium", "Meteora DLMM", "Meteora DYN", "Pump.Swap"];
    const isAboutToGraduate =
      Number(newDataMessage?.progress) >= 10 &&
      !dexes.includes(newDataMessage?.dex);

    if (isAboutToGraduate) {
      return;
    } else if (
      newDataMessage.dex === "Raydium" ||
      newDataMessage.dex === "Meteora DLMM" ||
      newDataMessage.dex === "Meteora DYN" ||
      newDataMessage.dex === "Pump.Swap"
    ) {
      return;
    } else {
      if (newDataMessage.type === "new") {
        if (
          isNewlyCreatedListHoveredRef.current ||
          isCosmoTutorialRef.current
        ) {
          if (
            newlyCreatedListRef.current.find(
              (item) => item.mint === newDataMessage.mint,
            )
          ) {
            updateNewlyCreated(newDataMessage);
            updateNewlyCreatedChangedCount();
          } else {
            setPausedNewlyCreated((prevList: CosmoDataMessageType[]) => [
              newDataMessage,
              ...prevList,
            ]);
          }
        } else {
          updateNewlyCreated(newDataMessage);
          updateNewlyCreatedChangedCount();
        }
      } else {
        if (newDataMessage.progress < 50) {
          if (
            isNewlyCreatedListHoveredRef.current ||
            isCosmoTutorialRef.current
          ) {
            if (
              newlyCreatedListRef.current.find(
                (item) => item.mint === newDataMessage.mint,
              )
            ) {
              updateNewlyCreated(newDataMessage);
              updateNewlyCreatedChangedCount();
            } else {
              setOtherPausedNewlyCreated((prevList: CosmoDataMessageType[]) => [
                newDataMessage,
                ...prevList,
              ]);
            }
          } else {
            updateNewlyCreated(newDataMessage);
            updateNewlyCreatedChangedCount();
          }
        }
      }
    }
  };

  const processMessageQueue = () => {
    const currentQueue = [...messageQueueRef.current];
    messageQueueRef.current = [];

    currentQueue.forEach(({ data: newDataMessage }) => {
      updateLatestMessages(newDataMessage);

      const dexes = ["Raydium", "Meteora DLMM", "Meteora DYN", "Pump.Swap"];
      const isAboutToGraduate =
        Number(newDataMessage?.progress) >= 10 &&
        !dexes.includes(newDataMessage?.dex);

      if (isAboutToGraduate) {
        if (isAboutToGraduateHoveredRef.current || isCosmoTutorialRef.current) {
          if (
            aboutToGraduateListRef.current.find(
              (item) => item.mint === newDataMessage.mint,
            )
          ) {
            updateAboutToGraduate(newDataMessage);
            updateAboutToGraduatedChangedCount();
          } else {
            setPausedAboutToGraduate((prevList: CosmoDataMessageType[]) => [
              newDataMessage,
              ...prevList,
            ]);
          }
        } else {
          updateAboutToGraduate(newDataMessage);
          updateAboutToGraduatedChangedCount();
        }
      } else if (
        newDataMessage.dex === "Raydium" ||
        newDataMessage.dex === "Meteora DLMM" ||
        newDataMessage.dex === "Meteora DYN" ||
        newDataMessage.dex === "Pump.Swap"
      ) {
        if (isGraduatedListHoveredRef.current || isCosmoTutorialRef.current) {
          if (
            graduatedListRef.current.find(
              (item) => item.mint === newDataMessage.mint,
            )
          ) {
            updateGraduated(newDataMessage);
            updateGraduatedChangedCount();
          } else {
            setPausedGraduated((prevList: CosmoDataMessageType[]) => [
              newDataMessage,
              ...prevList,
            ]);
          }
        } else {
          updateGraduated(newDataMessage);
          updateGraduatedChangedCount();
        }
      } else {
        return;
      }
    });
  };

  const { addError } = useWebsocketMonitor();

  const { send, disconnect } = useWebsocket({
    name: "cosmo",
    url: String(getWSBaseURLBasedOnRegion()),
    onopen: () => {
      handleSendMessage();

      processingTimerRef.current = setInterval(
        processMessageQueue,
        COSMO_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onmessage: (event) => {
      try {
        if (event.data.includes("success") || event.data.includes("Ping"))
          return;
        const {
          data: newDataMessage,
        }: { channel: any; data: CosmoDataMessageType } = JSON.parse(
          event.data,
        );

        if (
          newDataMessage.type === "new" ||
          messageQueueRef.current.some(
            (item) =>
              item.data.mint === newDataMessage.mint &&
              item.data.image &&
              newDataMessage.image,
          )
        ) {
          processNewTokenMessage(newDataMessage);
        } else {
          messageQueueRef.current.push({
            data: newDataMessage,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        addError("cosmo", {
          message: (error as any).message || "Error parsing message",
          timestamp: new Date(),
        });
      }
    },
  });

  useEffect(() => {
    return () => {
      disconnect();
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = () => {
    const token = cookies.get("_nova_session");
    if (!token || token === "") return disconnect();

    try {
      const subscriptionMessage = [
        {
          channel: "cosmo",
          token: token,
        },
      ];

      send(JSON.stringify(subscriptionMessage));
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };

  const width = useWindowSizeStore((state) => state.width);

  const [isFirstLoading, setIsFirstLoading] = useState(true);

  useEffect(() => {
    if (
      !isLoadingFilterFetchNewlyCreatedList &&
      !isLoadingFilterFetchAboutToGraduateList &&
      !isLoadingFilterFetchGraduateList &&
      newlyCreatedList.length > 0 &&
      aboutToGraduateList.length > 0 &&
      graduatedList.length > 0
    ) {
      setIsFirstLoading(false);
    }
  }, [
    isLoadingFilterFetchNewlyCreatedList,
    isLoadingFilterFetchAboutToGraduateList,
    isLoadingFilterFetchGraduateList,
    newlyCreatedList,
    aboutToGraduateList,
    graduatedList,
  ]);

  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );
  const isSnap = usePopupStore((state) =>
    state.popups.some((popup) => popup.snappedSide !== "none" && popup.isOpen),
  );

  if (remainingScreenWidth! < 1000 && isSnap) {
    return (
      <>
        <CosmoMobile
          isListHoveredNewlyCreated={
            isCosmoTutorial || isNewlyCreatedListHovered
          }
          setIsListHoveredNewlyCreated={setIsNewlyCreatedListHovered}
          isListHoveredAboutToGraduate={
            isCosmoTutorial || isAboutToGraduateListHovered
          }
          setIsListHoveredAboutToGraduate={setIsAboutToGraduateHovered}
          isListHoveredGraduated={isCosmoTutorial || isGraduatedListHovered}
          setIsListHoveredGraduated={setIsGraduatedListHovered}
          isLoading={isLoading || isRefetching || isFirstLoading}
        />
      </>
    );
  }

  return (
    <>
      {!width ? (
        <>
          <div className="relative mb-14 hidden w-full flex-grow grid-cols-3 gap-x-5 bg-[#080811] xl:mb-12 xl:grid">
            <CosmoListSectionLoading column={1} variant="desktop" />
            <CosmoListSectionLoading column={2} variant="desktop" />
            <CosmoListSectionLoading column={3} variant="desktop" />
          </div>
          <div className="relative mb-14 h-full w-full flex-grow gap-x-5 xl:hidden">
            <CosmoListSectionLoading column={1} variant="mobile" />
          </div>
        </>
      ) : width! >= 1280 ? (
        <CosmoDesktop
          isListHoveredNewlyCreated={
            isCosmoTutorial || isNewlyCreatedListHovered
          }
          setIsListHoveredNewlyCreated={setIsNewlyCreatedListHovered}
          isListHoveredAboutToGraduate={
            isCosmoTutorial || isAboutToGraduateListHovered
          }
          setIsListHoveredAboutToGraduate={setIsAboutToGraduateHovered}
          isListHoveredGraduated={isCosmoTutorial || isGraduatedListHovered}
          setIsListHoveredGraduated={setIsGraduatedListHovered}
          isLoading={isLoading || isRefetching || isFirstLoading}
        />
      ) : (
        <CosmoMobile
          isListHoveredNewlyCreated={
            isCosmoTutorial || isNewlyCreatedListHovered
          }
          setIsListHoveredNewlyCreated={setIsNewlyCreatedListHovered}
          isListHoveredAboutToGraduate={
            isCosmoTutorial || isAboutToGraduateListHovered
          }
          setIsListHoveredAboutToGraduate={setIsAboutToGraduateHovered}
          isListHoveredGraduated={isCosmoTutorial || isGraduatedListHovered}
          setIsListHoveredGraduated={setIsGraduatedListHovered}
          isLoading={isLoading || isRefetching || isFirstLoading}
        />
      )}
    </>
  );
}
