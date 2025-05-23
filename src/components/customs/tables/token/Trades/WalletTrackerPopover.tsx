"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectEmoji from "@/components/customs/SelectEmoji";
import CustomToast from "@/components/customs/toasts/CustomToast";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import CircleCount from "@/components/customs/CircleCount";
// ######## Utils & Helpers 🤝 ########
import {
  TrackedWallet,
  updateTrackedWallets,
} from "@/apis/rest/wallet-tracker";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { truncateAddress } from "@/utils/truncateAddress";
import { Badge } from "@/components/ui/badge";
import { usePopupStore } from "@/stores/use-popup-state";

export default function WalletTrackerPopover({
  isFirst,
  makerAddress,
  isBuy,
  emojis,
  circleCount,
  isDeveloper,
  freshWalletFundedInfo,
  walletDefault,
}: {
  isFirst: boolean;
  makerAddress: string;
  isBuy?: boolean;
  emojis: string[];
  circleCount: number;
  isDeveloper: boolean;
  walletDefault?: boolean;

  freshWalletFundedInfo?: {
    wallet: string;
    fundedAmount: string;
    fundedBy: string;
    timestamp: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { remainingScreenWidth } = usePopupStore();

  const existingWallets = useWalletTrackerStore(
    (state) => state.trackedWallets,
  );
  const [walletName, setWalletName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");

  useEffect(() => {
    if (walletAddress.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [walletAddress]);
  const queryClient = useQueryClient();

  const addWalletMutation = useMutation({
    mutationFn: (newWallet: TrackedWallet) =>
      updateTrackedWallets([...(existingWallets || []), newWallet]),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tracked-wallets"],
      });
      setOpen(false);
      setWalletAddress("");
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Wallet added successfully"
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

  const handleSubmit = () => {
    if (!walletName || !walletAddress) {
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Please fill in all fields"
          state="ERROR"
        />
      ));
      return;
    }

    addWalletMutation.mutate({
      emoji: selectedEmoji,
      name: walletName,
      address: walletAddress,
    });
  };

  // const isBlue =
  //   transaction?.type?.toLowerCase() === "add" || transaction?.first_trade;

  return (
    <>
      <div className="flex items-center gap-x-1" title="Set Wallet Address">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-x-1"
              onClick={() => setWalletAddress(makerAddress)}
            >
              <AddressWithEmojis
                walletDefault={walletDefault}
                isWithOverview
                isFirst={isFirst}
                buy={isBuy}
                fullAddress={makerAddress}
                address={truncateAddress(makerAddress)}
                emojis={emojis}
                freshWalletFundedInfo={freshWalletFundedInfo}
              />
              <CircleCount value={circleCount} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="gb__white__popover h-auto w-[320px] rounded-[8px] border border-border p-0">
            <div className="flex h-[56px] w-full items-center justify-start border-b border-border px-4 md:p-4">
              <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                Add Wallet Tracker
              </h4>
              <PopoverClose
                onClick={() => {
                  setWalletAddress("");
                }}
                className="ml-auto inline-block cursor-pointer text-fontColorSecondary"
              >
                <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </PopoverClose>
            </div>
            <div className="relative flex w-full flex-grow flex-col px-4 pb-3 pt-2">
              <div className="flex w-full gap-x-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-fontColorSecondary">
                    Emoji
                  </Label>
                  <SelectEmoji
                    value={selectedEmoji}
                    onChange={setSelectedEmoji}
                  />
                </div>
                <div className="flex w-full flex-col gap-1">
                  <Label className="text-xs text-fontColorSecondary">
                    Wallet Name
                  </Label>
                  <Input
                    value={walletName}
                    onChange={(e) => {
                      console.log("WALLET NAME ✨", e.target.value);
                      console.log("WALLET address ✨", walletAddress);
                      setWalletName(e.target.value);
                    }}
                    placeholder="Wallet Name"
                    className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
              <BaseButton
                onClick={handleSubmit}
                isLoading={addWalletMutation.isPending}
                disabled={addWalletMutation.isPending}
                type="button"
                variant="primary"
                className="h-8 w-full"
              >
                <span className="text-sm">Add Wallet</span>
              </BaseButton>
            </div>
          </PopoverContent>
        </Popover>
        {isDeveloper && remainingScreenWidth > 1500 && (
          <Badge className="bg-white/[12%] py-1 leading-3 text-warning">
            DEV
          </Badge>
        )}
      </div>
    </>
  );
}
