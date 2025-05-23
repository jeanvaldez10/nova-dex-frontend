"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useRef } from "react";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useQuery } from "@tanstack/react-query";
// ######## APIs 🛜 ########
import { getWalletTracker } from "@/apis/rest/wallet-tracker";
// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import DexBuySettings from "@/components/customs/DexBuySettings";
import WalletTrackerContent from "@/components/customs/WalletTrackerContent";
const WalletTrackerClient = () => {
  const setWalletTrackerList = useWalletTrackerMessageStore(
    (state) => state.setInitMessages,
  );

  const isClient = useRef<boolean>(false);
  useEffect(() => {
    isClient.current = true;
  }, [isClient]);

  const {
    data: trackerData,
    isLoading: isTrackerDataLoading,
    isFetched: isFetchedTracker,
  } = useQuery({
    queryKey: ["wallet-tracker"],
    queryFn: async () => getWalletTracker(),
  });

  useEffect(() => {
    if (trackerData) {
      setWalletTrackerList(trackerData);
    }
  }, [trackerData]);

  return (
    <>
      <NoScrollLayout mobileOnWhichBreakpoint="xl">
        <div className="flex w-full flex-col flex-wrap justify-between gap-y-2 px-4 pb-3 pt-4 xl:flex-row xl:items-center xl:gap-y-4 xl:px-0 xl:pb-4 xl:pt-3">
          <PageHeading
            title="Wallet Tracker"
            description="Add any wallet to receive real-time notifications on trades and activity"
            line={1}
            showDescriptionOnMobile
          />
          <DexBuySettings variant="Wallet Tracker" />
        </div>

        <div className="flex w-full flex-grow flex-col items-center justify-center xl:px-0">
          <WalletTrackerContent
            isTrackerDataLoading={isTrackerDataLoading || !isFetchedTracker}
          />
        </div>
      </NoScrollLayout>
      {/* <WalletTrackerInteractiveTutorials /> */}
    </>
  );
};

export default WalletTrackerClient;
