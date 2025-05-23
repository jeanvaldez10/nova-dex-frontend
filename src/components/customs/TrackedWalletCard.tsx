"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useSelectedWalletTrackerTradeAddressesFilterStore } from "@/stores/footer/use-selected-wallet-tracker-trade-filter.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
// ######## Components 🧩 ########
import Image from "next/image";
import Copy from "@/components/customs/Copy";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import EditWalletForm from "@/components/customs/EditTrackedWallet";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import truncateCA from "@/utils/truncateCA";
import EditTrackedWallet from "@/components/customs/EditTrackedWallet";
import BaseButton from "./buttons/BaseButton";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";

const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS_2 =
  "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-auto z-[1000]";

export type TrackedWalletCardProps = {
  name: string;
  address: string;
  emoji: string;
  trackedWallets: TrackedWallet[];
};

export default function TrackerWalletCard({
  name,
  address,
  emoji,
  trackedWallets,
}: TrackedWalletCardProps) {
  const queryClient = useQueryClient();
  const trackedEnabledSound = useWalletTrackerStore(
    (state) => state.trackedEnabledSound,
  );
  const setTrackerEnabledSound = useWalletTrackerStore(
    (state) => state.setTrackerEnabledSound,
  );

  const currentSelectedAddresses =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.selectedWalletAddresses,
    );
  const setSelectedWalletAddressesFilter =
    useSelectedWalletTrackerTradeAddressesFilterStore(
      (state) => state.setSelectedWalletAddresses,
    );
  const handleFilterTradeOfThisWallet = () => {
    if (!currentSelectedAddresses.includes(address)) {
      setSelectedWalletAddressesFilter([...currentSelectedAddresses, address]);
    } else {
      const newFilter = currentSelectedAddresses.filter((a) => a !== address);
      setSelectedWalletAddressesFilter(newFilter);
    }
  };

  const handleSoundToggle = () => {
    if (typeof trackedEnabledSound == "boolean") {
      setTrackerEnabledSound([address]);
    } else if (trackedEnabledSound.includes(address)) {
      setTrackerEnabledSound(trackedEnabledSound.filter((w) => w !== address));
    } else {
      setTrackerEnabledSound([...trackedEnabledSound, address]);
    }
  };

  const isSoundEnabled =
    typeof trackedEnabledSound == "boolean"
      ? false
      : trackedEnabledSound?.includes(address);

  const updateWalletsMutation = useMutation({
    mutationFn: updateTrackedWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-tracker"] });
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallets updated successfully"
          state="SUCCESS"
        />
      ));
    },
    onError: (error: Error) => {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message={error.message}
          state="ERROR"
        />
      ));
    },
  });

  const handleDelete = (address: string) => {
    updateWalletsMutation.mutate(
      trackedWallets.filter((w) => w.address !== address),
    );
    // handleFilterTradeOfThisWallet();
    const newFilter = currentSelectedAddresses.filter((a) => a !== address);
    setSelectedWalletAddressesFilter(newFilter);
  };

  return (
    <div
      className={cn(
        "relative grid h-[70px] w-full grid-cols-2 items-center justify-between gap-x-3 overflow-hidden rounded-[8px] border border-border px-4 duration-300 max-md:border md:py-[10px] md:hover:bg-shadeTableHover xl:rounded-none xl:border-none",
        currentSelectedAddresses.includes(address)
          ? "bg-[#191024]"
          : "odd:bg-shadeTable",
      )}
    >
      <div className="flex items-start gap-x-3">
        <div
          onClick={handleFilterTradeOfThisWallet}
          className="relative -mt-[1.5px] aspect-square h-5 w-5 flex-shrink-0 cursor-pointer"
        >
          <Image
            src={
              currentSelectedAddresses.includes(address)
                ? "/icons/footer/checked.png"
                : "/icons/footer/unchecked.png"
            }
            alt="Check / Unchecked Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <div className="flex h-[32px] w-full flex-col justify-center xl:-ml-0.5">
          <div className="flex flex-col justify-center gap-y-0">
            <h4
              onClick={handleFilterTradeOfThisWallet}
              className="w-fit cursor-pointer text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"
            >
              {emoji}
              <span className="ml-1">{name}</span>
            </h4>

            <span className="flex items-center justify-start gap-x-1 text-nowrap pl-0.5 text-xs text-fontColorSecondary">
              <span className="text-xs">{truncateCA(address, 10)}</span>
              <Copy className="size-4" value={address} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-1">
        <BaseButton
          onClick={() => handleSoundToggle()}
          variant="gray"
          size="short"
          className="relative size-[32px] bg-secondary"
        >
          <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src={
                !isSoundEnabled
                  ? "/icons/footer/sound-on.png"
                  : "/icons/footer/sound-off.png"
              }
              alt="Sound On Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </BaseButton>

        <EditTrackedWallet
          triggerElement={
            <button
              type="button"
              className="relative flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-secondary duration-300 hover:bg-white/[12%]"
            >
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/wallet-trades-edit.png"
                  alt="Edit Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </button>
          }
          address={address}
        />

        <button
          type="button"
          onClick={() => handleDelete(address)}
          disabled={updateWalletsMutation.isPending}
          className="relative flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-x-1 overflow-hidden rounded-[8px] bg-secondary duration-300 hover:bg-white/[12%]"
        >
          <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src={
                updateWalletsMutation.isPending
                  ? "/icons/search-loading.png"
                  : "/icons/footer/delete.png"
              }
              alt="Delete Icon"
              fill
              quality={100}
              className={cn(
                "object-contain",
                updateWalletsMutation.isPending && "animate-spin",
              )}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
